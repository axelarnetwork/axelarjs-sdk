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
  GMPRecoveryResponse,
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
  GMPQueryError,
  InsufficientFundsError,
  InvalidGasTokenError,
  InvalidTransactionError,
  NotApprovedError,
  NotGMPTransactionError,
  UnsupportedGasTokenError,
} from "./constants/error";
import { callExecute, CALL_EXECUTE_ERROR, getCommandId } from "./helpers";
import { retry, sleep, throwIfInvalidChainIds } from "../../utils";
import { EventResponse } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/query";
import { Event_Status } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/types";
import { Interface } from "ethers/lib/utils";
import { ChainInfo } from "src/chains/types";

export const GMPErrorMap: Record<string, ApproveGatewayError> = {
  [GMPStatus.CANNOT_FETCH_STATUS]: ApproveGatewayError.FETCHING_STATUS_FAILED,
  [GMPStatus.DEST_EXECUTED]: ApproveGatewayError.ALREADY_EXECUTED,
  [GMPStatus.DEST_GATEWAY_APPROVED]: ApproveGatewayError.ALREADY_APPROVED,
};

interface ConfirmTxSDKResponse {
  success: boolean;
  errorMessage?: string;
  infoLogs: string[];
  commandId: string;
  confirmTx?: AxelarTxResponse;
  eventResponse?: EventResponse;
}

interface SignTxSDKResponse {
  success: boolean;
  errorMessage?: string;
  signCommandTx?: AxelarTxResponse;
  infoLogs: string[];
}

interface BroadcastTxSDKResponse {
  success: boolean;
  errorMessage?: string;
  approveTx?: AxelarTxResponse;
  infoLogs: string[];
}

interface GMPRecoveryError {
  success: false;
  error: string;
}

interface GMPRecoverySuccess {
  success: true;
  infoLogs: string[];
  signCommandTx?: AxelarTxResponse;
  approveTx?: AxelarTxResponse;
  confirmTx?: AxelarTxResponse;
}

export enum RouteDir {
  COSMOS_TO_EVM = "cosmos_to_evm",
  EVM_TO_COSMOS = "evm_to_cosmos",
  EVM_TO_EVM = "evm_to_evm",
}

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
    return getCommandId(destChainId, txHash, eventIndex, this.environment, rpcInfo);
  }

  public async doesTxMeetConfirmHt(chain: string, txHash: string) {
    const confirmations = await this.getSigner(chain)
      .provider.getTransactionReceipt(txHash)
      .then((receipt) => receipt.confirmations);

    return this.axelarQueryApi
      .getConfirmationHeight(chain)
      .then((minConfirmHeight) => minConfirmHeight <= confirmations)
      .catch(() => undefined);
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
    infoLog: string;
  }> {
    let eventIndex = -1,
      success = false,
      errorMessage = "",
      infoLog = "";

    eventIndex = await this.getEventIndex(srcChainId, srcTxHash, evmWalletDetails)
      .then((index) => index as number)
      .catch(() => -1);

    if (eventIndex === -1) {
      return {
        success,
        errorMessage: `getEvmEvent(): could not find event index for ${srcTxHash}`,
        commandId: "",
        eventResponse: {},
        infoLog,
      };
    }

    const commandId = this.getCidFromSrcTxHash(destChainId, srcTxHash, eventIndex);
    infoLog = `srcTxHash: ${srcTxHash}, generated commandId: ${commandId}`;

    const eventResponse = await retry(
      () => this.axelarQueryApi.getEVMEvent(srcChainId, srcTxHash, eventIndex),
      12,
      10000
    );

    if (!eventResponse || this.isEVMEventFailed(eventResponse)) {
      errorMessage = this.isEVMEventFailed(eventResponse)
        ? `getEvmEvent(): event on source chain is not successful for: ${srcTxHash}`
        : `getEvmEvent(): could not determine status of event: ${srcTxHash}`;
      return {
        success,
        errorMessage,
        commandId,
        eventResponse: {},
        infoLog,
      };
    }

    success = true;
    infoLog = `${srcTxHash} correspondes to command ID: ${commandId}`;

    return {
      commandId,
      eventResponse,
      success,
      errorMessage,
      infoLog,
    };
  }

  public async findEventAndConfirmIfNeeded(
    srcChain: string,
    destChain: string,
    txHash: string,
    evmWalletDetails: EvmWalletDetails,
    sleepSeconds = 60
  ): Promise<ConfirmTxSDKResponse> {
    const res: ConfirmTxSDKResponse = {
      success: true,
      errorMessage: "",
      infoLogs: [],
      commandId: "",
    };
    let confirmLog = "";

    if (this.debugMode)
      console.debug(`confirmation: checking whether ${txHash} needs to be confirmed on Axelar`);

    const evmEventResponse = await this.getEvmEvent(srcChain, destChain, txHash, evmWalletDetails);
    res.commandId = evmEventResponse.commandId;
    res.eventResponse = evmEventResponse.eventResponse;
    const { infoLog: getEvmEventInfoLog } = evmEventResponse;
    if (this.debugMode) console.debug(`confirmation: ${getEvmEventInfoLog}`);

    if (
      this.isEVMEventCompleted(res.eventResponse) ||
      this.isEVMEventConfirmed(res.eventResponse)
    ) {
      confirmLog = `confirmation: event for ${txHash} was already detected on the network and did not need to be confirmed`;
    } else {
      const isConfirmed = await this.doesTxMeetConfirmHt(srcChain, txHash);
      if (!isConfirmed) {
        const minConfirmLevel = await this.axelarQueryApi.getConfirmationHeight(srcChain);
        return {
          ...res,
          success: false,
          errorMessage: `findEventAndConfirmIfNeeded(): ${txHash} is not confirmed on ${srcChain}. The minimum confirmation height is ${minConfirmLevel}`,
        };
      }

      res.confirmTx = await this.confirmGatewayTx(txHash, srcChain).catch(() => {
        return undefined;
      });
      if (!res.confirmTx) {
        return {
          ...res,
          success: false,
          errorMessage: `findEventAndConfirmIfNeeded(): could not confirm transaction on Axelar`,
        };
      }
      confirmLog = `confirmation: successfully confirmed ${txHash} on Axelar; waiting ${sleepSeconds} seconds for network confirmation`;
      if (this.debugMode) console.debug(confirmLog);

      const updatedEvent = await this.getEvmEvent(srcChain, destChain, txHash, evmWalletDetails);

      if (this.isEVMEventCompleted(updatedEvent?.eventResponse)) {
        res.eventResponse = updatedEvent.eventResponse;
        confirmLog += `; confirmed event was finalized`;
      } else {
        res.success = false;
        res.errorMessage = `findEventAndConfirmIfNeeded(): could not confirm and finalize event successfully: ${txHash};. Your transaction may not have enough confirmations yet.`;
        confirmLog += `; confirmed event was unable to be finalized`;
      }
    }
    if (this.debugMode) console.debug(confirmLog);

    getEvmEventInfoLog && res.infoLogs.push(getEvmEventInfoLog);
    res.infoLogs.push(confirmLog);

    return res;
  }

  public async findBatchAndSignIfNeeded(commandId: string, destChainId: string) {
    let signTxLog = "";
    try {
      const batchData = await this.fetchBatchData(destChainId, commandId);
      if (batchData) {
        signTxLog = `signing: batch data exists so do not need to sign. commandId: ${commandId}, batchId: ${batchData.batch_id}`;
        if (this.debugMode) console.debug(signTxLog);
        return {
          success: true,
          infoLogs: [signTxLog],
        };
      } else {
        const signCommandTx = await this.signCommands(destChainId);
        signTxLog = `signing: signed batch for commandId (${commandId}) in tx: ${signCommandTx.transactionHash}`;
        if (this.debugMode) console.debug(signTxLog);
        return {
          success: true,
          signCommandTx,
          infoLogs: [signTxLog],
        };
      }
    } catch (e) {
      return {
        success: false,
        errorMessage: `findBatchAndSignIfNeeded(): issue retrieving and signing command data: ${commandId}`,
        infoLogs: [signTxLog],
      };
    }
  }

  public async findBatchAndApproveGateway(
    commandId: string,
    destChainId: string,
    wallet: EvmWalletDetails
  ): Promise<BroadcastTxSDKResponse> {
    if (this.debugMode)
      console.debug(`broadcasting: checking for command ID: ${commandId} to broadcast`);

    return retry(
      async () => {
        const batchData = await this.fetchBatchData(destChainId, commandId);
        if (!batchData) {
          return Promise.reject(
            `findBatchAndBroadcast(): unable to retrieve batch data for ${commandId}`
          );
        }

        const commandData = batchData.command_ids.find((t) => t === commandId);

        if (!commandData) {
          return Promise.reject(
            `findBatchAndBroadcast(): unable to retrieve command ID (${commandId}) in batch data`
          );
        }

        if (batchData.status === "BATCHED_COMMANDS_STATUS_SIGNING") {
          return Promise.reject(
            `findBatchAndBroadcast(): batch ID ${batchData.batch_id} signing in process`
          );
        } else if (batchData.status === "BATCHED_COMMANDS_STATUS_SIGNED") {
          const approveTx = await this.sendApproveTx(destChainId, batchData.execute_data, wallet);
          return {
            success: true,
            approveTx,
            infoLogs: [
              `broadcasting: batch ID ${batchData.batch_id} broadcasted to ${destChainId}`,
            ],
          };
        } else {
          return Promise.reject(
            `findBatchAndBroadcast(): batch ID ${batchData.batch_id} is in an unknown state for command data: ${commandId}`
          );
        }
      },
      3,
      10
    ).catch((error: any) => {
      return {
        success: false,
        errorMessage:
          error.message || // error can be both a string or an object with a message property
          error ||
          `findBatchAndBroadcastIfNeeded(): issue retrieving and broadcasting command data: ${commandId}`,
        infoLogs: [],
      };
    });
  }

  public async manualRelayToDestChain(
    txHash: string,
    evmWalletDetails?: EvmWalletDetails,
    escapeAfterConfirm = true
  ): Promise<GMPRecoveryResponse> {
    const { callTx, status } = await this.queryTransactionStatus(txHash);

    /**first check if transaction is already executed */
    if (GMPErrorMap[status])
      return {
        success: false,
        error: GMPErrorMap[status],
      };
    const srcChain: string = callTx.chain;
    const destChain: string = callTx.returnValues.destinationChain;
    const srcChainInfo = await this.getChainInfo(srcChain);
    const destChainInfo = await this.getChainInfo(destChain);
    const routeDir = this.getRouteDir(srcChainInfo, destChainInfo);
    const _evmWalletDetails = evmWalletDetails || { useWindowEthereum: true };

    if (routeDir === RouteDir.COSMOS_TO_EVM) {
      return this.recoverCosmosToEvmTx(txHash, _evmWalletDetails);
    } else if (routeDir === RouteDir.EVM_TO_COSMOS) {
      return this.recoverEvmToCosmosTx(srcChain, txHash);
    } else {
      return this.recoverEvmToEvmTx(
        srcChain,
        destChain,
        txHash,
        _evmWalletDetails,
        escapeAfterConfirm
      );
    }
  }

  public getRouteDir(srcChain: ChainInfo, destChain: ChainInfo) {
    if (srcChain.module === "axelarnet" && destChain.module === "evm") {
      return RouteDir.COSMOS_TO_EVM;
    } else if (srcChain.module === "evm" && destChain.module === "axelarnet") {
      return RouteDir.EVM_TO_COSMOS;
    } else {
      return RouteDir.EVM_TO_EVM;
    }
  }

  private async recoverEvmToCosmosTx(srcChain: string, txHash: string) {
    // Check if the tx is confirmed on the source chain
    const isConfirmed = await this.doesTxMeetConfirmHt(srcChain, txHash);
    if (!isConfirmed) {
      const minConfirmLevel = await this.axelarQueryApi.getConfirmationHeight(srcChain);
      return {
        success: false,
        error: `${txHash} is not confirmed on ${srcChain}. The minimum confirmation height is ${minConfirmLevel}`,
      };
    }

    // ConfirmGatewayTx and check if it is successfully executed
    const confirmTx = await this.confirmGatewayTx(txHash, srcChain).catch(() => undefined);

    if (!confirmTx) {
      return {
        success: false,
        error: "Failed to send ConfirmGatewayTx to Axelar",
      };
    }

    // Fetch all necessary data to send the route message tx
    const payload = await this.fetchGMPTransaction(txHash).then(
      (data) => data.call.returnValues.payload
    );
    const logIndex = await this.getEventIndex(srcChain as EvmChain, txHash);

    // Send the route message tx
    const routeMessageTx = await this.routeMessageRequest(txHash, payload, logIndex).catch(
      () => undefined
    );

    // If the `success` flag is false, return the error response
    if (!routeMessageTx) {
      return {
        success: false,
        error: "Failed to send RouteMessage to Axelar",
      };
    }

    // Return the success response
    return {
      success: true,
      confirmTx,
      routeMessageTx,
      infoLogs: [
        `Successfully sent ConfirmGatewayTx tx for given tx hash ${txHash}`,
        `Successfully sent RouteMessage tx for given tx hash ${txHash}`,
      ],
    };
  }

  private async recoverCosmosToEvmTx(txHash: string, evmWalletDetails: EvmWalletDetails) {
    const txDetails = await this.fetchGMPTransaction(txHash);
    const { messageId, payload, destinationChain } = txDetails.call.returnValues;
    const { command_id: commandId } = txDetails;

    // Send RouteMessageTx
    const routeMessageTx = await this.routeMessageRequest(messageId, payload, -1).catch(
      () => undefined
    );

    if (!routeMessageTx) {
      return {
        success: false,
        error: "Failed to send RouteMessage to Axelar",
      };
    }

    // Dispatch a SignCommand transaction and an Approve transaction to the Gateway contract.
    const response = await this.signAndApproveGateway(
      commandId,
      destinationChain,
      evmWalletDetails
    );

    // If the response.success is false, we will return the error response
    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    // Otherwise, we will return the success response
    const { signCommandTx, infoLogs: signTxLogs } = response;

    return {
      success: true,
      routeMessageTx,
      signCommandTx,
      infoLogs: [`Successfully sent RouteMessage tx for given ${txHash}`, ...signTxLogs],
    };
  }

  private async recoverEvmToEvmTx(
    srcChain: string,
    destChain: string,
    txHash: string,
    evmWalletDetails: EvmWalletDetails,
    escapeAfterConfirm = true
  ) {
    try {
      // ConfirmGatewayTx and check if it is successfully executed
      const confirmTxRequest = await this.findEventAndConfirmIfNeeded(
        srcChain,
        destChain,
        txHash,
        evmWalletDetails
      );

      // If the `success` flag is false, we will return the error response
      if (!confirmTxRequest?.success) {
        return {
          success: false,
          error: confirmTxRequest.errorMessage || ApproveGatewayError.ERROR_BATCHED_COMMAND,
        };
      }

      const { infoLogs: confirmTxLogs, commandId, confirmTx } = confirmTxRequest;

      // If the `escapeAfterConfirm` flag is set to true, we will return the `confirmTx` and `infoLogs` immediately without signing the batch.
      if (confirmTx && escapeAfterConfirm) {
        return {
          success: true,
          confirmTx,
          infoLogs: confirmTxLogs,
        };
      }

      // Find the batch and sign it
      const response = await this.signAndApproveGateway(commandId, destChain, evmWalletDetails);

      // If the response.success is false, we will return the error response
      if (!response.success) {
        return {
          success: false,
          error: response.error,
        };
      }

      // Otherwise, we will return the success response
      const { signCommandTx, infoLogs: signTxLogs } = response;
      return {
        success: true,
        confirmTx,
        signCommandTx,
        approveTx: response.approveTx,
        infoLogs: [...confirmTxLogs, ...signTxLogs],
      };

      // If more code is required here, you can add it below.
    } catch (e: any) {
      return {
        success: false,
        error: e.message || ApproveGatewayError.CONFIRM_COMMAND_FAILED,
      };
    }
  }

  private async signAndApproveGateway(
    commandId: string,
    destChain: string,
    evmWalletDetails: EvmWalletDetails
  ): Promise<GMPRecoveryError | GMPRecoverySuccess> {
    try {
      const signTxRequest = await this.findBatchAndSignIfNeeded(commandId, destChain);

      if (!signTxRequest?.success) {
        return {
          success: false,
          error: signTxRequest.errorMessage || ApproveGatewayError.SIGN_COMMAND_FAILED,
        };
      }

      const broadcastTxRequest = await this.findBatchAndApproveGateway(
        commandId,
        destChain,
        evmWalletDetails
      );

      if (!broadcastTxRequest?.success) {
        return {
          success: false,
          error: broadcastTxRequest.errorMessage || ApproveGatewayError.ERROR_BROADCAST_EVENT,
        };
      }

      return {
        success: true,
        signCommandTx: signTxRequest.signCommandTx,
        approveTx: broadcastTxRequest.approveTx,
        infoLogs: [...(signTxRequest.infoLogs || []), ...(broadcastTxRequest.infoLogs || [])],
      };
    } catch (e) {
      throw new Error(`Error finding batch: ${e}`);
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
   * Check if given transaction is already confirmed.
   * @param txHash string - transaction hash
   * @returns Promise<boolean> - true if transaction is already confirmed
   */
  public async isConfirmed(txHash: string): Promise<boolean> {
    const txStatus: GMPStatusResponse | undefined = await this.queryTransactionStatus(txHash).catch(
      () => undefined
    );
    return [GMPStatus.SRC_GATEWAY_CONFIRMED, GMPStatus.DEST_GATEWAY_APPROVED].includes(
      this.parseGMPStatus(txStatus?.status) as GMPStatus
    );
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
    const hasTxBeenConfirmed = (await this.isConfirmed(txHash)) || false;
    options.shouldSubtractBaseFee = hasTxBeenConfirmed;

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

  public async getEventIndex(chain: string, txHash: string, evmWalletDetails?: EvmWalletDetails) {
    const signer = this.getSigner(chain, evmWalletDetails || { useWindowEthereum: true });
    const receipt = await signer.provider.getTransactionReceipt(txHash);
    if (!receipt) return -1;
    const eventIndex = getEventIndexFromTxReceipt(receipt);
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
        {
          estimatedGas: options?.estimatedGasUsed,
          gasMultipler: options?.gasMultipler,
          provider: evmWalletDetails.provider,
        }
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

    const axelarGateway = await AxelarGateway.create(this.environment, chain, signer.provider);
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
      options.estimatedGas,
      options.gasMultipler,
      undefined,
      undefined
    );

    let topupGasAmount = ethers.BigNumber.from(totalGasFee);
    if (options.shouldSubtractBaseFee) {
      const response = await this.axelarQueryApi
        .getNativeGasBaseFee(sourceChain, destinationChain, gasTokenSymbol as GasToken)
        .catch(() => undefined);
      if (response && response.baseFee) {
        topupGasAmount = topupGasAmount.sub(response.baseFee);
      }
    }
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
