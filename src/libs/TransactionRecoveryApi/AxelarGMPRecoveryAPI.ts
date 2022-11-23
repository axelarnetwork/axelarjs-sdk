import fetch from "cross-fetch";
import {
  AxelarRecoveryAPIConfig,
  EvmChain,
  EVMClientConfig,
  EvmWalletDetails,
  AddGasOptions,
  GasToken,
  TxResult,
  QueryGasFeeOptions,
  ApproveGatewayError,
  ApproveGatewayResponse,
  AxelarTxResponse,
} from "../types";
import {
  AxelarRecoveryApi,
  ExecuteParams,
  GMPStatus,
  GMPStatusResponse,
} from "./AxelarRecoveryApi";
import EVMClient from "./client/EVMClient";
import IAxelarExecutable from "../abi/IAxelarExecutable";
import { ContractReceipt, ContractTransaction, ethers } from "ethers";
import { NATIVE_GAS_TOKEN_SYMBOL } from "./constants/contract";
import { AxelarQueryAPI } from "../AxelarQueryAPI";
import rpcInfo from "./constants/chain";
import {
  getDestinationChainFromTxReceipt,
  getGasAmountFromTxReceipt,
  getLogIndexFromTxReceipt,
  getNativeGasAmountFromTxReceipt,
} from "./helpers/contractEventHelper";
import Erc20 from "../abi/erc20Abi.json";
import { AxelarGateway } from "../AxelarGateway";
import { getDefaultProvider } from "./helpers/providerHelper";
import {
  AlreadyExecutedError,
  AlreadyPaidGasFeeError,
  ContractCallError,
  ExecutionRevertedError,
  GasPriceAPIError,
  GMPQueryError,
  InsufficientFundsError,
  InvalidGasTokenError,
  InvalidTransactionError,
  NotApprovedError,
  NotGMPTransactionError,
  UnsupportedGasTokenError,
} from "./constants/error";
import { callExecute, CALL_EXECUTE_ERROR } from "./helpers";
import { asyncRetry, sleep, throwIfInvalidChainIds } from "../../utils";
import { BatchedCommandsResponse } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/query";
import s3 from "./constants/s3";
import { Interface } from "ethers/lib/utils";
import { loadChains } from "../../chains";

export class AxelarGMPRecoveryAPI extends AxelarRecoveryApi {
  axelarQueryApi: AxelarQueryAPI;
  public constructor(config: AxelarRecoveryAPIConfig) {
    super(config);
    this.axelarQueryApi = new AxelarQueryAPI({
      environment: config.environment,
      axelarRpcUrl: this.axelarRpcUrl,
      axelarLcdUrl: this.axelarLcdUrl,
    });
  }

  private async saveGMP(
    sourceTransactionHash: string,
    relayerAddress: string,
    transactionHash?: string,
    error?: any
  ) {
    return await this.execPost(super.getAxelarGMPApiUrl, "", {
      method: "saveGMP",
      sourceTransactionHash,
      transactionHash,
      relayerAddress,
      error,
    });
  }

  public async manualRelayToDestChain(
    txHash: string,
    evmWalletDetails?: EvmWalletDetails
  ): Promise<ApproveGatewayResponse> {
    const _evmWalletDetails = evmWalletDetails || { useWindowEthereum: true };

    const { callTx, status } = await this.queryTransactionStatus(txHash);

    let confirmTx: Nullable<AxelarTxResponse>;
    let createPendingTransferTx: Nullable<AxelarTxResponse>;
    let signCommandTx: Nullable<AxelarTxResponse>;

    const errorResponse = (error: ApproveGatewayError, errorDetails?: string) => ({
      success: false,
      error: errorDetails || error,
      confirmTx,
      createPendingTransferTx,
      signCommandTx,
    });

    if (status === GMPStatus.CANNOT_FETCH_STATUS)
      return errorResponse(ApproveGatewayError.FETCHING_STATUS_FAILED);
    if (status === GMPStatus.DEST_EXECUTED)
      return errorResponse(ApproveGatewayError.ALREADY_EXECUTED);
    if (status === GMPStatus.DEST_GATEWAY_APPROVED)
      return errorResponse(ApproveGatewayError.ALREADY_APPROVED);

    const srcChain = callTx.chain;
    const destChain = callTx.returnValues.destinationChain;

    try {
      confirmTx = await this.confirmGatewayTx(txHash, srcChain);
      await sleep(2);

      createPendingTransferTx = await this.createPendingTransfers(destChain);
      await sleep(2);

      signCommandTx = await this.signCommands(destChain);
      const signEvent = signCommandTx.rawLog[0]?.events?.find(
        (event: any) => event.type === "sign"
      );

      if (!signEvent) return errorResponse(ApproveGatewayError.SIGN_COMMAND_FAILED);

      await sleep(2);
      const batchedCommandId = signEvent.attributes.find(
        (attr: any) => attr.key === "batchedCommandId"
      )?.value;

      const batchedCommand = await asyncRetry(
        () => this.queryBatchedCommands(destChain, batchedCommandId),
        (res?: BatchedCommandsResponse) => !!res && res.executeData?.length > 0
      );
      if (!batchedCommand) return errorResponse(ApproveGatewayError.ERROR_BATCHED_COMMAND);

      await sleep(2);

      const approveTx = await this.sendApproveTx(
        destChain,
        batchedCommand.executeData,
        _evmWalletDetails
      );

      return {
        success: true,
        confirmTx,
        createPendingTransferTx,
        signCommandTx,
        approveTx,
      };
    } catch (e: any) {
      if (e.message.includes("account sequence mismatch")) {
        return errorResponse(ApproveGatewayError.ERROR_ACCOUNT_SEQUENCE_MISMATCH);
      }
      return errorResponse(ApproveGatewayError.ERROR_UNKNOWN, e.message);
    }
  }

  /**
   * Check if given transaction is already executed.
   * @param txHash string - transaction hash
   * @returns Promise<boolean> - true if transaction is already executed
   */
  public async isExecuted(txHash: string): Promise<boolean> {
    const txStatus: GMPStatusResponse | undefined = await this.queryTransactionStatus(txHash).catch(
      () => undefined
    );
    return txStatus?.status === GMPStatus.DEST_EXECUTED;
  }

  /**
   * Calculate the gas fee in native token for executing a transaction at the destination chain using the source chain's gas price.
   * @param txHash string - transaction hash
   * @param sourceChain EVMChain - source chain
   * @param destinationChain EVMChain - destination chain
   * @param gasTokenSymbol string - gas token symbol
   * @param options QueryGasFeeOptions - options
   * @returns Promise<string> - The gas fee to be paid at source chain
   */
  public async calculateNativeGasFee(
    txHash: string,
    sourceChain: string,
    destinationChain: string,
    gasTokenSymbol: GasToken | string,
    options: QueryGasFeeOptions
  ): Promise<string> {
    await throwIfInvalidChainIds([sourceChain, destinationChain], this.environment);

    const provider = options.provider || getDefaultProvider(sourceChain, this.environment);
    const receipt = await provider.getTransactionReceipt(txHash);
    const paidGasFee = getNativeGasAmountFromTxReceipt(receipt) || "0";

    return this.subtractGasFee(sourceChain, destinationChain, gasTokenSymbol, paidGasFee, options);
  }

  /**
   * Calculate the gas fee in an ERC-20 tokens for executing a transaction at the destination chain using the source chain's gas price.
   * @param txHash string - transaction hash
   * @param sourceChain EVMChain - source chain
   * @param destinationChain EVMChain - destination chain
   * @param gasTokenSymbol string - gas token symbol
   * @param options QueryGasFeeOptions - options
   * @returns Promise<string> - The gas fee to be paid at source chain
   */
  public async calculateGasFee(
    txHash: string,
    sourceChain: EvmChain,
    destinationChain: EvmChain,
    gasTokenSymbol: GasToken | string,
    options: QueryGasFeeOptions
  ): Promise<string> {
    await throwIfInvalidChainIds([sourceChain, destinationChain], this.environment);

    const provider = options.provider || getDefaultProvider(sourceChain, this.environment);
    const receipt = await provider.getTransactionReceipt(txHash);
    const paidGasFee = getGasAmountFromTxReceipt(receipt) || "0";

    return this.subtractGasFee(sourceChain, destinationChain, gasTokenSymbol, paidGasFee, options);
  }

  /**
   * Pay native token as gas fee for the given transaction hash.
   * If the transaction details is not valid, it will return an error with reason.
   * @param chain - source chain
   * @param txHash - transaction hash
   * @param options - options
   * @returns
   */
  public async addNativeGas(
    chain: EvmChain,
    txHash: string,
    options?: AddGasOptions
  ): Promise<TxResult> {
    const evmWalletDetails = options?.evmWalletDetails || { useWindowEthereum: true };
    const signer = this.getSigner(chain, evmWalletDetails);
    const signerAddress = await signer.getAddress();
    const gasReceiverAddress = await this.getGasReceiverContractAddress(chain);
    const nativeGasTokenSymbol = NATIVE_GAS_TOKEN_SYMBOL[chain];
    const receipt = await signer.provider.getTransactionReceipt(txHash);

    if (!receipt) return InvalidTransactionError(chain);

    const destinationChain = getDestinationChainFromTxReceipt(receipt);
    const logIndex = getLogIndexFromTxReceipt(receipt);

    // Check if given txHash is valid
    if (!destinationChain) return NotGMPTransactionError();

    // Check if the transaction status is already executed or not.
    const _isExecuted = await this.isExecuted(txHash);
    if (_isExecuted) return AlreadyExecutedError();

    let gasFeeToAdd = options?.amount;

    if (!gasFeeToAdd) {
      gasFeeToAdd = await this.calculateNativeGasFee(
        txHash,
        chain,
        destinationChain,
        nativeGasTokenSymbol,
        { estimatedGas: options?.estimatedGasUsed, provider: evmWalletDetails.provider }
      ).catch(() => undefined);
    }

    // Check if gas price is queried successfully.
    if (!gasFeeToAdd) return GasPriceAPIError();

    // Check if gas fee is not already sufficiently paid.
    if (gasFeeToAdd === "0") return AlreadyPaidGasFeeError();

    const refundAddress = options?.refundAddress || signerAddress;
    const contract = new ethers.Contract(
      gasReceiverAddress,
      [
        "function addNativeGas(bytes32 txHash,uint256 logIndex,address refundAddress) external payable",
      ],
      signer
    );
    return contract
      .addNativeGas(txHash, logIndex, refundAddress, {
        value: gasFeeToAdd,
      })
      .then((tx: ContractTransaction) => tx.wait())
      .then((tx: ContractReceipt) => ({
        success: true,
        transaction: tx,
      }))
      .catch(ContractCallError);
  }

  /**
   * Pay ERC20 token as gas fee for the given transaction hash.
   * If the transaction details or `gasTokenAddress` is not valid, it will return an error with reason.
   *
   * @param chain EvmChain - The source chain of the transaction hash.
   * @param txHash string - The transaction hash.
   * @param gasTokenAddress string - The address of the ERC20 token to pay as gas fee.
   * @param options AddGasOptions - The options to pay gas fee.
   * @returns
   */
  public async addGas(
    chain: EvmChain,
    txHash: string,
    gasTokenAddress: string,
    options?: AddGasOptions
  ): Promise<TxResult> {
    const evmWalletDetails = options?.evmWalletDetails || { useWindowEthereum: true };
    const signer = this.getSigner(chain, evmWalletDetails);
    const signerAddress = await signer.getAddress();
    const gasReceiverAddress = await this.getGasReceiverContractAddress(chain);
    const gasTokenContract = new ethers.Contract(gasTokenAddress, Erc20, signer.provider);
    const gasTokenSymbol = await gasTokenContract.symbol().catch(() => undefined);

    // Check if given `gasTokenAddress` exists
    if (!gasTokenSymbol) return InvalidGasTokenError();

    const axelarGateway = AxelarGateway.create(this.environment, chain, signer.provider);
    const gatewayGasTokenAddress = await axelarGateway.getTokenAddress(gasTokenSymbol);

    // Check if given `gasTokenAddress` is supported by Axelar.
    if (gatewayGasTokenAddress === ethers.constants.AddressZero)
      return UnsupportedGasTokenError(gasTokenAddress);

    const receipt = await signer.provider.getTransactionReceipt(txHash);

    // Check if transaction exists
    if (!receipt) return InvalidTransactionError(chain);

    const destinationChain = getDestinationChainFromTxReceipt(receipt);
    const logIndex = getLogIndexFromTxReceipt(receipt);

    // Check if given txHash is valid
    if (!destinationChain) return NotGMPTransactionError();

    // Check if the transaction status is already executed or not.
    const _isExecuted = await this.isExecuted(txHash);
    if (_isExecuted) return AlreadyExecutedError();

    let gasFeeToAdd = options?.amount;

    if (!gasFeeToAdd) {
      gasFeeToAdd = await this.calculateGasFee(txHash, chain, destinationChain, gasTokenSymbol, {
        estimatedGas: options?.estimatedGasUsed,
        provider: evmWalletDetails.provider,
      }).catch(() => undefined);
    }

    // Check if gas price is queried successfully.
    if (!gasFeeToAdd) return GasPriceAPIError();

    // Check if gas fee is not already sufficiently paid.
    if (gasFeeToAdd === "0") return AlreadyPaidGasFeeError();

    const refundAddress = options?.refundAddress || signerAddress;
    const contract = new ethers.Contract(
      gasReceiverAddress,
      new Interface([
        "function addGas(bytes32 txHash,uint256 txIndex,address gasToken,uint256 gasFeeAmount,address refundAddress) external",
      ]),
      signer
    );
    return contract
      .addGas(txHash, logIndex, gasTokenAddress, gasFeeToAdd, refundAddress)
      .then((tx: ContractTransaction) => tx.wait())
      .then((tx: ContractReceipt) => ({
        success: true,
        transaction: tx,
      }))
      .catch(ContractCallError);
  }

  /**
   * Execute a transaction on the destination chain associated with given `srcTxHash`.
   * @param srcTxHash - The transaction hash on the source chain.
   * @param srcTxLogIndex - The log index of the transaction on the source chain.
   * @param evmWalletDetails - The wallet details to use for executing the transaction.
   * @returns The result of executing the transaction.
   */
  public async execute(
    srcTxHash: string,
    srcTxLogIndex?: number,
    evmWalletDetails?: EvmWalletDetails
  ): Promise<TxResult> {
    const response = await this.queryExecuteParams(srcTxHash, srcTxLogIndex).catch(() => undefined);
    // Couldn't query the transaction details
    if (!response) return GMPQueryError();
    // Already executed
    if (response?.status === GMPStatus.DEST_EXECUTED) return AlreadyExecutedError();
    // Not Approved yet
    if (response?.status !== GMPStatus.DEST_GATEWAY_APPROVED) return NotApprovedError();

    const executeParams = response.data as ExecuteParams;
    const { destinationChain, destinationContractAddress } = executeParams;

    const signer = this.getSigner(destinationChain, evmWalletDetails);
    const contract = new ethers.Contract(destinationContractAddress, IAxelarExecutable.abi, signer);

    const txResult: TxResult = await callExecute(executeParams, contract)
      .then((tx: ContractReceipt) => {
        const {
          commandId,
          sourceChain,
          sourceAddress,
          payload,
          symbol,
          amount,
          isContractCallWithToken,
        } = executeParams;
        const functionName = isContractCallWithToken ? "executeWithToken" : "execute";
        return {
          success: true,
          transaction: tx,
          data: {
            functionName,
            args: {
              commandId,
              sourceChain,
              sourceAddress,
              payload,
              symbol,
              amount,
            },
          },
        };
      })
      .catch((e: Error) => {
        if (e.message === CALL_EXECUTE_ERROR.INSUFFICIENT_FUNDS) {
          return InsufficientFundsError(executeParams);
        } else if (e.message === CALL_EXECUTE_ERROR.REVERT) {
          return ExecutionRevertedError(executeParams);
        } else {
          // should not happen
          return ContractCallError(e);
        }
      });

    // Submit execute data to axelarscan if the contract execution is success.
    const signerAddress = await signer.getAddress();
    const executeTxHash = txResult.transaction?.transactionHash;
    if (executeTxHash) {
      await this.saveGMP(srcTxHash, signerAddress, executeTxHash).catch(() => undefined);
    } else {
      await this.saveGMP(srcTxHash, signerAddress, "", txResult.error).catch(() => undefined);
    }

    return txResult;
  }

  private async subtractGasFee(
    sourceChain: string,
    destinationChain: string,
    gasTokenSymbol: string,
    paidGasFee: string,
    options: QueryGasFeeOptions
  ) {
    const totalGasFee = await this.axelarQueryApi.estimateGasFee(
      sourceChain,
      destinationChain,
      gasTokenSymbol,
      options.estimatedGas
    );

    const topupGasAmount = ethers.BigNumber.from(totalGasFee).sub(paidGasFee);
    return topupGasAmount.gt(0) ? topupGasAmount.toString() : "0";
  }

  private getSigner(
    chain: string,
    evmWalletDetails: EvmWalletDetails = { useWindowEthereum: true }
  ) {
    const { rpcMap, networkInfo } = rpcInfo[this.environment];
    const evmClientConfig: EVMClientConfig = {
      rpcUrl: rpcMap[chain],
      networkOptions: networkInfo[chain],
      evmWalletDetails,
    };
    const evmClient = new EVMClient(evmClientConfig);
    return evmClient.getSigner();
  }

  public async getGasReceiverContractAddress(chainId: string): Promise<string> {
    const chains = await loadChains({ environment: this.environment });
    const selectedChain = chains.find((chain) => chain.id === chainId);
    if (!selectedChain) throw `getGasReceiverContractAddress() ${chainId} not found`;
    const { chainName } = selectedChain;
    return await fetch(s3[this.environment])
      .then((res) => res.json())
      .then((body) => body.assets.network[chainName.toLowerCase()]?.gas_service)
      .catch(() => "");
  }
}
