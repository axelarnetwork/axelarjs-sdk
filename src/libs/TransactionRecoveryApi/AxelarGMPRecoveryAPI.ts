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
  BatchedCommandsAxelarscanResponse,
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
  getEventIndexFromTxReceipt,
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
  // GMPErrorMap,
  // GMPErrorResponse,
  GMPQueryError,
  InsufficientFundsError,
  InvalidGasTokenError,
  InvalidTransactionError,
  NotApprovedError,
  NotGMPTransactionError,
  UnsupportedGasTokenError,
} from "./constants/error";
import { callExecute, CALL_EXECUTE_ERROR, getCommandId } from "./helpers";
import { sleep, throwIfInvalidChainIds } from "../../utils";
import { EventResponse } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/query";
import { Event_Status } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/types";
import { Interface } from "ethers/lib/utils";

export const GMPErrorMap: Record<string, ApproveGatewayError> = {
  [GMPStatus.CANNOT_FETCH_STATUS]: ApproveGatewayError.FETCHING_STATUS_FAILED,
  [GMPStatus.DEST_EXECUTED]: ApproveGatewayError.ALREADY_EXECUTED,
  [GMPStatus.DEST_GATEWAY_APPROVED]: ApproveGatewayError.ALREADY_APPROVED,
};

export const GMPErrorResponse = (error: ApproveGatewayError, errorDetails?: string) => ({
  success: false,
  error: errorDetails || error,
});

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

  public getCidFromSrcTxHash(destChainId: string, txHash: string, eventIndex: number) {
    return getCommandId(destChainId, txHash, eventIndex, this.environment);
  }

  public async doesTxMeetConfirmHt(chain: string, currHeight: number) {
    return this.axelarQueryApi
      .getConfirmationHeight(chain)
      .then((res) => res.height.greaterThan(currHeight))
      .catch((e) => undefined);
  }

  public isEVMEventFailed(eventResponse: EventResponse | undefined): boolean | undefined {
    if (!eventResponse) return undefined;
    return [Event_Status.STATUS_FAILED, Event_Status.STATUS_UNSPECIFIED].includes(
      eventResponse.event?.status as Event_Status
    );
  }

  public isEVMEventConfirmed(eventResponse: EventResponse): boolean | undefined {
    if (!eventResponse) return undefined;
    return eventResponse.event?.status === Event_Status.STATUS_CONFIRMED;
  }
  public isEVMEventCompleted(eventResponse: EventResponse): boolean | undefined {
    if (!eventResponse) return undefined;
    return eventResponse.event?.status === Event_Status.STATUS_COMPLETED;
  }
  public async getEvmEvent(
    srcChainId: string,
    destChainId: string,
    srcTxHash: string,
    evmWalletDetails?: EvmWalletDetails
  ): Promise<{
    commandId: string;
    eventResponse: EventResponse;
    success: boolean;
    errorMessage: string;
  }> {
    let eventIndex: number = -1,
      success = false,
      errorMessage = "";

    try {
      eventIndex = (await this.getEventIndex(
        srcChainId as EvmChain,
        srcTxHash,
        evmWalletDetails
      )) as number;
    } catch (e) {
      return {
        success,
        errorMessage: `getEvmEvent(): could not find event index for ${srcTxHash}`,
        commandId: "",
        eventResponse: {},
      };
    }

    const commandId = this.getCidFromSrcTxHash(destChainId, srcTxHash, eventIndex);
    console.log("command ID", commandId);

    const eventResponse = await this.axelarQueryApi.getEVMEvent(srcChainId, srcTxHash, eventIndex);
    if (!eventResponse || this.isEVMEventFailed(eventResponse)) {
      errorMessage = this.isEVMEventFailed(eventResponse)
        ? `getEvmEvent(): event on source chain is not successful for: ${srcTxHash}`
        : `getEvmEvent(): could not determine status of event: ${srcTxHash}`;
      return {
        success,
        errorMessage,
        commandId,
        eventResponse: {},
      };
    }

    success = true;

    return {
      commandId,
      eventResponse,
      success,
      errorMessage,
    };
  }

  public async findEventAndConfirmIfNeeded(
    srcChain: EvmChain,
    destChain: EvmChain,
    txHash: string,
    evmWalletDetails: EvmWalletDetails,
    sleepSeconds: number = 30
  ) {
    let confirmTx = null,
      success = true,
      errorMessage,
      infoLog,
      commandId,
      eventResponse;

    const evmEventResponse = await this.getEvmEvent(srcChain, destChain, txHash, evmWalletDetails);
    commandId = evmEventResponse.commandId;
    eventResponse = evmEventResponse.eventResponse;
    const { success: erSuccess, errorMessage: evmEventErrorMessage } = evmEventResponse;

    if (
      !eventResponse ||
      (!this.isEVMEventCompleted(eventResponse) && !this.isEVMEventConfirmed(eventResponse))
    ) {
      /**todo, need to check whether tx is finalized */
      // const confirmationHeight = await this.axelarQueryApi.getConfirmationHeight(srcChain);
      console.log("findEventAndConfirmIfNeeded confirming");

      confirmTx = await this.confirmGatewayTx(txHash, srcChain);
      console.log("findEventAndConfirmIfNeeded confirmed");
      infoLog = `successfully confirmed the transaction on the Axelar network`;
      await sleep(sleepSeconds);

      const updatedEvent = await this.getEvmEvent(srcChain, destChain, txHash, evmWalletDetails);

      if (!this.isEVMEventCompleted(updatedEvent?.eventResponse)) {
        success = false;
        errorMessage = `findEventAndConfirmIfNeeded(): could not confirm and finalize event successfully: ${txHash}`;
        infoLog += `; although confirmed event was unable to be finalized`;
      } else {
        eventResponse = updatedEvent.eventResponse;
      }
    } else {
      console.log("findEventAndConfirmIfNeeded do not need to confirm");
      infoLog = `event was already detected on the network and did not need to be confirmed`;
    }

    return {
      success,
      confirmTx,
      errorMessage,
      commandId,
      eventResponse,
      infoLog,
    };
  }

  public async findBatchAndSignIfNeeded(
    commandId: string,
    destChainId: string,
    _evmWalletDetails: EvmWalletDetails,
    sleepSeconds: number = 60
  ) {
    let success = true,
      errorMessage = "",
      signCommandTx = null;

    try {
      console.log("findBatchAndSignIfNeeded method");
      if (!(await this.fetchBatchData(destChainId, commandId))) {
        console.log("findBatchAndSignIfNeeded signing");
        signCommandTx = await this.signCommands(destChainId);
        console.log("findBatchAndSignIfNeeded signed");
        success = true;
      } else {
        console.log("findBatchAndSignIfNeeded do not need to sign");
      }
      await sleep(sleepSeconds);
    } catch (e) {
      errorMessage = `findBatchAndSignIfNeeded(): issue retrieving and signing command data: ${commandId}`;
      success = false;
    }
    return {
      success,
      signCommandTx,
      errorMessage,
    };
  }

  public async findBatchAndBroadcastIfNeeded(
    commandId: string,
    destChainId: string,
    _evmWalletDetails: EvmWalletDetails,
    iteration = 0,
    maxTries = 2
  ) {
    if (iteration > maxTries)
      return {
        success: false,
        errorMessage: `findBatchAndBroadcastIfNeeded(): this recovery stalled out on waiting for signing. please try again later. `,
      };

    let success = true,
      errorMessage = "",
      approveTx = null;

    try {
      console.log("findBatchAndBroadcastIfNeeded method");
      const batchData = await this.fetchBatchData(destChainId, commandId);
      if (!batchData)
        return {
          success: false,
          errorMessage: `findBatchAndBroadcastIfNeeded(): unable to retrieve batch data for ${commandId}`,
          approveTx,
        };

      console.log("batchData", commandId, batchData);

      const commandData = batchData.command_ids.find((t) => t === commandId);
      if (!commandData)
        return {
          success: false,
          errorMessage: `findBatchAndBroadcastIfNeeded(): unable to retrieve command ID (${commandId}) in batch data`,
          approveTx,
        };

      if (batchData.status === "BATCHED_COMMANDS_STATUS_SIGNED") {
        console.log("findBatchAndBroadcastIfNeeded attempting to broadcast");
        approveTx = await this.sendApproveTx(
          destChainId,
          batchData.execute_data,
          _evmWalletDetails
        );
        console.log("findBatchAndBroadcastIfNeeded broadcasted");
      } else if (batchData.status === "BATCHED_COMMANDS_STATUS_SIGNING") {
        console.log("findBatchAndBroadcastIfNeeded still signing, checking again in 15 seconds");
        sleep(15);
        this.findBatchAndBroadcastIfNeeded(
          commandId,
          destChainId,
          _evmWalletDetails,
          iteration + 1,
          maxTries
        );
      } else {
        errorMessage = `findBatchAndBroadcastIfNeeded(): status unsuccessful for command data: ${commandId}`;
        console.log("findBatchAndBroadcastIfNeeded() " + errorMessage);
        success = false;
      }
    } catch (e) {
      errorMessage = `findBatchAndBroadcastIfNeeded(): issue retrieving and broadcasting command data: ${commandId}`;
      success = false;
    }
    return {
      success,
      approveTx,
      errorMessage,
    };
  }

  public async manualRelayToDestChain(
    txHash: string,
    evmWalletDetails?: EvmWalletDetails
  ): Promise<ApproveGatewayResponse | null> {
    let confirmTx: AxelarTxResponse | null = null;
    let signCommandTx: AxelarTxResponse | null = null;
    let approveTx: any = null;
    let success: boolean = true;
    let infoLogs: string[] = [];

    const _evmWalletDetails = evmWalletDetails || { useWindowEthereum: true };

    const { callTx, status } = await this.queryTransactionStatus(txHash);

    /**first check if transaction is already executed */
    if (GMPErrorMap[status]) return GMPErrorResponse(GMPErrorMap[status]);
    const srcChain = callTx.chain;
    const destChain = callTx.returnValues.destinationChain;

    // const evmEventResponse = await this.getEvmEvent(srcChain, destChain, txHash, evmWalletDetails);
    // const { commandId, eventResponse, success: erSuccess, errorMessage } = evmEventResponse;

    // if (!erSuccess) return GMPErrorResponse(ApproveGatewayError.ERROR_GET_EVM_EVENT, errorMessage);

    let commandId = "",
      eventResponse;

    /**find event and confirm if needed */
    let confirmTxRequest;
    try {
      confirmTxRequest = await this.findEventAndConfirmIfNeeded(
        srcChain,
        destChain,
        txHash,
        _evmWalletDetails
      );
      confirmTx = confirmTxRequest.confirmTx;
      commandId = confirmTxRequest.commandId;
      eventResponse = confirmTxRequest.eventResponse;
      if (confirmTxRequest.infoLog) infoLogs.push(confirmTxRequest.infoLog);
    } catch (e) {
      throw `error determining event to confirm, ${e}`;
    }

    if (!confirmTxRequest?.success)
      return GMPErrorResponse(
        ApproveGatewayError.ERROR_BATCHED_COMMAND,
        confirmTxRequest.errorMessage
      );
    else if (confirmTx) {
      return {
        success,
        confirmTx,
        infoLogs,
      };
    }

    /**find batch and sign if needed */
    let signTxRequest;
    try {
      signTxRequest = await this.findBatchAndSignIfNeeded(commandId, destChain, _evmWalletDetails);
      signCommandTx = signTxRequest.signCommandTx;
    } catch (e) {
      throw `error finding batch to sign, ${e}`;
    }
    if (!signTxRequest?.success)
      return GMPErrorResponse(ApproveGatewayError.SIGN_COMMAND_FAILED, signTxRequest.errorMessage);

    /**find batch and manually execute if needed */
    let broadcastTxRequest;
    try {
      broadcastTxRequest = await this.findBatchAndBroadcastIfNeeded(
        commandId,
        destChain,
        _evmWalletDetails
      );
      approveTx = broadcastTxRequest.approveTx;
    } catch (e) {
      throw `error finding batch to broadcast, ${e}`;
    }
    if (!broadcastTxRequest?.success)
      return GMPErrorResponse(
        ApproveGatewayError.ERROR_BROADCAST_EVENT,
        broadcastTxRequest.errorMessage
      );

    return {
      success,
      confirmTx,
      signCommandTx,
      approveTx,
      infoLogs,
    };
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

  public async getEventIndex(chain: EvmChain, txHash: string, evmWalletDetails?: EvmWalletDetails) {
    const signer = this.getSigner(chain, evmWalletDetails || { useWindowEthereum: true });
    const receipt = await signer.provider.getTransactionReceipt(txHash);
    if (!receipt) return -1;
    const eventIndex = getEventIndexFromTxReceipt(receipt);
    console.log("getEventIndex", eventIndex);
    return eventIndex;
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
    const gasReceiverAddress = await this.axelarQueryApi.getContractAddressFromConfig(
      chain,
      "gas_service"
    );
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
    const gasReceiverAddress = await this.axelarQueryApi.getContractAddressFromConfig(
      chain,
      "gas_service"
    );
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
    const gasLimitBuffer = evmWalletDetails?.gasLimitBuffer || 0;
    const { destinationChain, destinationContractAddress } = executeParams;

    const signer = this.getSigner(destinationChain, evmWalletDetails);
    const contract = new ethers.Contract(destinationContractAddress, IAxelarExecutable.abi, signer);

    const txResult: TxResult = await callExecute(executeParams, contract, gasLimitBuffer)
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
}
