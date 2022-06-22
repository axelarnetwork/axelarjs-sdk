import { loadChains } from "../../chains";
import { ChainInfo } from "../../chains/types";
import {
  AxelarRecoveryAPIConfig,
  EvmChain,
  EVMClientConfig,
  EvmWalletDetails,
  AddGasOptions,
  GasToken,
  TxResult,
  QueryGasFeeOptions,
} from "../types";
import { AxelarRecoveryApi, GMPStatus } from "./AxelarRecoveryApi";
import EVMClient from "./client/EVMClient";
import { broadcastCosmosTxBytes } from "./client/helpers/cosmos";
import AxelarGMPRecoveryProcessor from "./processors";
import IAxelarExecutable from "../abi/IAxelarExecutable";
import { BigNumber, ContractFunction, ContractReceipt, ContractTransaction, ethers } from "ethers";
import IAxelarGasService from "../abi/IAxelarGasService.json";
import { GAS_RECEIVER, NATIVE_GAS_TOKEN_SYMBOL } from "./constants/contract";
import { AxelarQueryAPI } from "../AxelarQueryAPI";
import { networkInfo, rpcMap } from "./constants/chain";
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
  GasPriceAPIError,
  InvalidGasTokenError,
  InvalidTransactionError,
  NotGMPTransactionError,
  UnsupportedGasTokenError,
} from "./constants/error";

export class AxelarGMPRecoveryAPI extends AxelarRecoveryApi {
  private processor: AxelarGMPRecoveryProcessor;
  axelarQueryApi: AxelarQueryAPI;
  public constructor(config: AxelarRecoveryAPIConfig) {
    super(config);
    this.processor = new AxelarGMPRecoveryProcessor(this);
    this.axelarQueryApi = new AxelarQueryAPI({
      environment: config.environment,
    });
  }

  public async saveGMP(
    sourceTransactionHash: string,
    transactionHash: string,
    relayerAddress: string,
    error?: any
  ) {
    return await this.execPost(super.getAxelarCachingServiceUrl, "", {
      method: "saveGMP",
      sourceTransactionHash,
      transactionHash,
      relayerAddress,
      error,
    });
  }

  public async confirmGatewayTx(params: { txHash: string; chain: string }) {
    const chain: ChainInfo = loadChains({
      environment: this.environment,
    }).find((chain) => chain.chainInfo.chainName.toLowerCase() === params.chain.toLowerCase())
      ?.chainInfo as ChainInfo;
    if (!chain) throw new Error("cannot find chain" + params.chain);

    const txBytes = await this.execRecoveryUrlFetch("/confirm_gateway_tx", {
      ...params,
      module: chain.module,
      chain: chain.chainIdentifier[this.environment],
    });

    const tx = await broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);

    return tx;
  }

  public async manualRelayToDestChain(params: {
    txHash: string;
    src: EvmChain;
    dest: EvmChain;
    debug?: boolean;
  }): Promise<"triggered relay" | "approved but not executed" | "already executed" | unknown> {
    return await this.processor.process(params);
  }

  public async isExecuted(txHash: string): Promise<boolean> {
    const txStatus = await this.queryTransactionStatus(txHash).catch(() => undefined);
    return txStatus?.status === GMPStatus.EXECUTED;
  }

  public async calculateNativeGasFee(
    txHash: string,
    sourceChain: EvmChain,
    destinationChain: EvmChain,
    gasTokenSymbol: GasToken | string,
    options: QueryGasFeeOptions
  ): Promise<string> {
    const provider = options.provider || getDefaultProvider(sourceChain);
    const receipt = await provider.getTransactionReceipt(txHash);
    const paidGasFee = getNativeGasAmountFromTxReceipt(receipt) || "0";

    return this.subtractGasFee(sourceChain, destinationChain, gasTokenSymbol, paidGasFee, options);
  }

  public async calculateGasFee(
    txHash: string,
    sourceChain: EvmChain,
    destinationChain: EvmChain,
    gasTokenSymbol: GasToken | string,
    options: QueryGasFeeOptions
  ): Promise<string> {
    const provider = options.provider || getDefaultProvider(sourceChain);
    const receipt = await provider.getTransactionReceipt(txHash);
    const paidGasFee = getGasAmountFromTxReceipt(receipt) || "0";

    return this.subtractGasFee(sourceChain, destinationChain, gasTokenSymbol, paidGasFee, options);
  }

  public async addNativeGas(
    chain: EvmChain,
    txHash: string,
    options?: AddGasOptions
  ): Promise<TxResult> {
    const evmWalletDetails = options?.evmWalletDetails || { useWindowEthereum: true };
    const signer = this.getSigner(chain, evmWalletDetails);
    const signerAddress = await signer.getAddress();
    const gasReceiverAddress = GAS_RECEIVER[this.environment][chain];
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
    const contract = new ethers.Contract(gasReceiverAddress, IAxelarGasService, signer);
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

  public async addGas(
    chain: EvmChain,
    txHash: string,
    gasTokenAddress: string,
    options?: AddGasOptions
  ) {
    const evmWalletDetails = options?.evmWalletDetails || { useWindowEthereum: true };
    const signer = this.getSigner(chain, evmWalletDetails);
    const signerAddress = await signer.getAddress();
    const gasReceiverAddress = GAS_RECEIVER[this.environment][chain];
    const gasTokenContract = new ethers.Contract(gasTokenAddress, Erc20, signer.provider);
    const gasTokenSymbol = await gasTokenContract.symbol().catch(() => undefined);

    // Check if given `gasTokenAddress` exists
    if (!gasTokenSymbol) return InvalidGasTokenError();

    const axelarGateway = AxelarGateway.create(this.environment, chain, signer.provider);
    const gatewayGasTokenAddress = await axelarGateway.getTokenAddress(gasTokenSymbol);

    // Check if given `gasTokenAddress` is supported by Axelar.
    if (!gatewayGasTokenAddress) return UnsupportedGasTokenError(gasTokenAddress);

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
    const contract = new ethers.Contract(gasReceiverAddress, IAxelarGasService, signer);
    return contract
      .addGas(txHash, logIndex, gasTokenAddress, gasFeeToAdd, refundAddress)
      .then((tx: ContractTransaction) => tx.wait())
      .then((tx: ContractReceipt) => ({
        success: true,
        transaction: tx,
      }))
      .catch(ContractCallError);
  }

  public async executeManually(
    data: {
      call: any;
      approved: any;
    },
    cb: any
  ): Promise<void> {
    try {
      const { call, approved } = data;
      const { event } = call;
      const { destinationChain, destinationContractAddress, payload } = call?.returnValues;
      const { commandId, sourceChain, sourceAddress, symbol, amount } = approved?.returnValues;

      const evmClientConfig: EVMClientConfig = {
        rpcUrl: rpcMap[destinationChain as EvmChain],
        evmWalletDetails: { useWindowEthereum: true },
      };

      const evmClient = new EVMClient(evmClientConfig);
      const signer = evmClient.getSigner();
      const address: string = await signer.getAddress();

      const contract = new ethers.Contract(
        destinationContractAddress,
        IAxelarExecutable.abi,
        signer
      );

      const methods: { [key: string]: ContractFunction } = {
        ContractCall: () => contract.execute(commandId, sourceChain, sourceAddress, payload),
        ContractCallWithToken: () =>
          contract.executeWithToken(
            commandId,
            sourceChain,
            sourceAddress,
            payload,
            symbol,
            BigNumber.from(amount).toString()
          ),
      };

      if (methods[event]) {
        let tx;
        try {
          tx = await methods[event]();
          if (tx.hash) {
            cb({
              status: "pending",
              message: "Wait for confirmation",
              txHash: tx.hash,
            });
          }
          await tx.wait(1);
          if (tx.hash) {
            cb({
              status: "success",
              message: "Execute successful",
              txHash: tx.hash,
            });
            await this.saveGMP(call?.transactionHash, tx.hash, address);
          }
        } catch (error: any) {
          await this.saveGMP(call?.transactionHash, tx?.hash, address, error);
          cb({
            status: "failed",
            message: error?.reason || error?.data?.message || error?.message,
            txHash: tx?.hash,
          });
        }
      } else {
        console.warn(`method ${event} does not exist!`);
      }
    } catch (error: any) {
      cb({
        status: "failed",
        message: error?.reason || error?.data?.message || error?.message,
        txHash: "",
      });
    }
  }

  private async subtractGasFee(
    sourceChain: EvmChain,
    destinationChain: EvmChain,
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
    chain: EvmChain,
    evmWalletDetails: EvmWalletDetails = { useWindowEthereum: true }
  ) {
    const evmClientConfig: EVMClientConfig = {
      rpcUrl: rpcMap[chain],
      networkOptions: networkInfo[chain],
      evmWalletDetails,
    };
    const evmClient = new EVMClient(evmClientConfig);
    return evmClient.getSigner();
  }
}
