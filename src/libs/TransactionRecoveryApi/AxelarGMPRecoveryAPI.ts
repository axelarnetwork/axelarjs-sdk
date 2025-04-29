import {
  AxelarRecoveryAPIConfig,
  EVMClientConfig,
  EvmWalletDetails,
  AddGasOptions,
  TxResult,
  QueryGasFeeOptions,
  ApproveGatewayError,
  GMPRecoveryResponse,
  AxelarTxResponse,
  Environment,
} from "../types";
import { EvmChain } from "../../constants/EvmChain";
import {
  AxelarRecoveryApi,
  ExecuteParams,
  GMPStatus,
  GMPStatusResponse,
} from "./AxelarRecoveryApi";
import EVMClient from "./client/EVMClient";
import IAxelarExecutable from "../abi/IAxelarExecutable";
import { ContractReceipt, ContractTransaction, ethers } from "ethers";
import { AxelarQueryAPI } from "../AxelarQueryAPI";
import rpcInfo from "./constants/chain";
import {
  getDestinationChainFromTxReceipt,
  getEventIndexFromTxReceipt,
  getLogIndexFromTxReceipt,
} from "./helpers/contractEventHelper";
import Erc20 from "../abi/erc20Abi.json";
import { AxelarGateway } from "../AxelarGateway";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
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
import { retry, throwIfInvalidChainIds } from "../../utils";
import { EventResponse } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/query";
import { Event_Status } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/types";
import { arrayify, Interface, parseUnits } from "ethers/lib/utils";
import { ChainInfo } from "src/chains/types";
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import s3 from "./constants/s3";
import { Coin, OfflineSigner } from "@cosmjs/proto-signing";
import { DeliverTxResponse, SigningStargateClient, StdFee } from "@cosmjs/stargate";
import { COSMOS_GAS_RECEIVER_OPTIONS } from "./constants/cosmosGasReceiverOptions";
import { JsonRpcProvider } from "@ethersproject/providers";
import { importS3Config } from "../../chains";
import * as StellarSdk from "@stellar/stellar-sdk";
import { tokenToScVal } from "./helpers/stellarHelper";

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
  COSMOS_TO_COSMOS = "cosmos_to_cosmos",
}

export type SendOptions = {
  txFee: StdFee;
  environment: Environment;
  offlineSigner: OfflineSigner;
  rpcUrl?: string;
  timeoutTimestamp?: number;
};

export type AddGasStellarParams = {
  senderAddress: string; // the contract address that initiates the gateway contract call.
  tokenAddress?: string; // defaults to native token, XLM.
  contractAddress?: string; // custom contract address. this will be useful for testnet since it's reset every quarter.
  amount: string; // the token amount to pay for the gas fee
  spender: string; // The address that pays for the gas fee.
  messageId: string; // The message ID of the transaction.
};

export type AutocalculateGasOptions = {
  gasMultipler?: number;
};

export type AddGasParams = {
  txHash: string;
  chain: string;
  token: Coin | "autocalculate";
  sendOptions: SendOptions;
  gasLimit: number;
  autocalculateGasOptions?: AutocalculateGasOptions;
};

export type AddGasSuiParams = {
  amount?: string;
  refundAddress: string;
  messageId: string;
  gasParams: string;
};

export type AddGasResponse = {
  success: boolean;
  info: string;
  broadcastResult?: DeliverTxResponse;
};

export type GetFullFeeOptions = {
  environment: Environment;
  autocalculateGasOptions?: AutocalculateGasOptions | undefined;
  tx: any;
  chainConfig: any;
};

export const getCosmosSigner = async (rpcUrl: string, offlineDirectSigner: OfflineSigner) => {
  return SigningStargateClient.connectWithSigner(rpcUrl, offlineDirectSigner);
};

function matchesOriginalTokenPayment(token: Coin | "autocalculate", denomOnSrcChain: string) {
  return token === "autocalculate" || token?.denom === denomOnSrcChain;
}

function getIBCDenomOnSrcChain(denomOnAxelar: string, selectedChain: any, chainConfigs: any) {
  const asset = chainConfigs["assets"][denomOnAxelar ?? "uaxl"];
  const assetOnSrcChain = asset["chain_aliases"][selectedChain.chainName.toLowerCase()];
  const ibcDenom = assetOnSrcChain?.ibcDenom;

  if (!ibcDenom) {
    throw new Error("cannot find token that matches original gas payment");
  }

  return ibcDenom;
}

export class AxelarGMPRecoveryAPI extends AxelarRecoveryApi {
  axelarQueryApi: AxelarQueryAPI;
  private staticInfo: Record<string, any>;
  public constructor(config: AxelarRecoveryAPIConfig) {
    super(config);
    this.axelarQueryApi = new AxelarQueryAPI({
      environment: config.environment,
      axelarRpcUrl: this.axelarRpcUrl,
      axelarLcdUrl: this.axelarLcdUrl,
    });
  }

  public getCidFromSrcTxHash(destChainId: string, messageId: string, eventIndex: number) {
    const chainId = rpcInfo[this.environment].networkInfo[destChainId.toLowerCase()]?.chainId;
    return getCommandId(messageId, eventIndex, chainId);
  }

  public async doesTxMeetConfirmHt(chain: string, txHash: string, provider?: JsonRpcProvider) {
    const confirmations = await this.getSigner(chain, { useWindowEthereum: false, provider })
      .provider.getTransactionReceipt(txHash)
      .then(async (receipt?: TransactionReceipt) => {
        if (!receipt) {
          const gmpTx = await this.fetchGMPTransaction(txHash);
          const currentBlock = await this.getSigner(chain, {
            useWindowEthereum: false,
            provider,
          }).provider.getBlockNumber();
          return currentBlock - gmpTx.call.blockNumber;
        }

        return receipt.confirmations;
      });

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
    srcTxEventIndex: number | undefined,
    evmWalletDetails?: EvmWalletDetails
  ): Promise<{
    commandId: string;
    eventResponse: EventResponse;
    success: boolean;
    errorMessage: string;
    infoLog: string;
  }> {
    const eventIndex =
      srcTxEventIndex ??
      (await this.getEventIndex(srcChainId, srcTxHash, evmWalletDetails)
        .then((index) => index as number)
        .catch(() => -1));

    if (eventIndex === -1) {
      return {
        success: false,
        errorMessage: `getEvmEvent(): could not find event index for ${srcTxHash}`,
        commandId: "",
        eventResponse: {},
        infoLog: "",
      };
    }

    const eventResponse = await this.axelarQueryApi.getEVMEvent(srcChainId, srcTxHash, eventIndex);
    const isCallContract = eventResponse?.event?.contractCall ? true : false;
    const messageId = isCallContract ? `${srcTxHash}-${eventIndex}` : srcTxHash;
    const commandId = this.getCidFromSrcTxHash(destChainId, messageId, eventIndex);

    if (!eventResponse || this.isEVMEventFailed(eventResponse)) {
      const errorMessage = this.isEVMEventFailed(eventResponse)
        ? `getEvmEvent(): event on source chain is not successful for: ${srcTxHash}`
        : `getEvmEvent(): could not determine status of event: ${srcTxHash}`;
      return {
        success: false,
        errorMessage,
        commandId,
        eventResponse: {},
        infoLog: `srcTxHash: ${srcTxHash}, generated commandId: ${commandId}`,
      };
    }

    return {
      success: true,
      commandId,
      eventResponse,
      errorMessage: "",
      infoLog: `${srcTxHash} correspondes to command ID: ${commandId}`,
    };
  }

  public async findEventAndConfirmIfNeeded(
    srcChain: string,
    destChain: string,
    txHash: string,
    txEventIndex: number | undefined,
    evmWalletDetails: EvmWalletDetails
  ): Promise<ConfirmTxSDKResponse> {
    if (this.debugMode)
      console.debug(`confirmation: checking whether ${txHash} needs to be confirmed on Axelar`);

    const evmEvent = await this.getEvmEvent(srcChain, destChain, txHash, txEventIndex);
    const { infoLog: getEvmEventInfoLog } = evmEvent;
    if (this.debugMode) console.debug(`confirmation: ${getEvmEventInfoLog}`);

    if (
      this.isEVMEventCompleted(evmEvent.eventResponse) ||
      this.isEVMEventConfirmed(evmEvent.eventResponse)
    ) {
      return {
        success: true,
        commandId: evmEvent.commandId,
        eventResponse: evmEvent.eventResponse,
        infoLogs: [
          `confirmation: event for ${txHash} was already detected on the network and did not need to be confirmed`,
        ],
      };
    } else {
      const isConfirmFinalized = await this.doesTxMeetConfirmHt(
        srcChain,
        txHash,
        evmWalletDetails.provider
      );
      if (!isConfirmFinalized) {
        const minConfirmLevel = await this.axelarQueryApi.getConfirmationHeight(srcChain);
        return {
          success: false,
          commandId: evmEvent.commandId,
          eventResponse: evmEvent.eventResponse,
          infoLogs: [],
          errorMessage: `findEventAndConfirmIfNeeded(): ${txHash} is not confirmed on ${srcChain}. The minimum confirmation height is ${minConfirmLevel}`,
        };
      }

      const confirmTx = await this.confirmGatewayTx(txHash, srcChain).catch(() => undefined);
      if (!confirmTx) {
        return {
          success: false,
          commandId: evmEvent.commandId,
          eventResponse: evmEvent.eventResponse,
          infoLogs: [],
          errorMessage: `findEventAndConfirmIfNeeded(): could not confirm transaction on Axelar`,
        };
      }

      const updatedEvent = await this.getEvmEvent(
        srcChain,
        destChain,
        txHash,
        txEventIndex,
        evmWalletDetails
      );

      if (this.isEVMEventCompleted(updatedEvent?.eventResponse)) {
        return {
          success: true,
          commandId: updatedEvent.commandId,
          eventResponse: updatedEvent.eventResponse,
          infoLogs: [
            `confirmation: successfully confirmed ${txHash} on Axelar; confirmed event was finalized`,
            getEvmEventInfoLog,
          ],
        };
      } else {
        return {
          success: false,
          eventResponse: evmEvent.eventResponse,
          commandId: updatedEvent.commandId,
          errorMessage: `findEventAndConfirmIfNeeded(): could not confirm and finalize event successfully: ${txHash};. Your transaction may not have enough confirmations yet.`,
          infoLogs: [
            `confirmation: successfully confirmed ${txHash} on Axelar; confirmed event was unable to be finalized`,
            getEvmEventInfoLog,
          ],
        };
      }
    }
  }

  public async findBatchAndSignIfNeeded(
    commandId: string,
    destChainId: string
  ): Promise<SignTxSDKResponse> {
    let signTxLog = "";
    try {
      const batchData = await retry(() => this.fetchBatchData(destChainId, commandId), 10, 3000);
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
            `findBatchAndApproveGateway(): unable to retrieve batch data for ${commandId}`
          );
        }

        const commandData = batchData.command_ids.find((t) => t === commandId);

        if (!commandData) {
          return Promise.reject(
            `findBatchAndApproveGateway(): unable to retrieve command ID (${commandId}) in batch data`
          );
        }

        if (batchData.status === "BATCHED_COMMANDS_STATUS_SIGNING") {
          return Promise.reject(
            `findBatchAndApproveGateway(): batch ID ${batchData.batch_id} signing in process`
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
            `findBatchAndApproveGateway(): batch ID ${batchData.batch_id} is in an unknown state for command data: ${commandId}`
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
          `findBatchAndApproveGatewayIfNeeded(): issue retrieving and broadcasting command data: ${commandId}`,
        infoLogs: [],
      };
    });
  }

  public async manualRelayToDestChain(
    txHash: string,
    txLogIndex?: number | undefined,
    txEventIndex?: number | undefined,
    evmWalletDetails?: EvmWalletDetails,
    escapeAfterConfirm = true,
    messageId?: string
  ): Promise<GMPRecoveryResponse> {
    const { callTx, status } = await this.queryTransactionStatus(txHash, txLogIndex);

    /**first check if transaction is already executed */
    if (GMPErrorMap[status])
      return {
        success: false,
        error: GMPErrorMap[status],
      };
    const srcChain: string = callTx.chain;
    const destChain: string = callTx.returnValues.destinationChain;
    const eventIndex = txEventIndex ?? callTx._logIndex;
    const srcChainInfo = await this.getChainInfo(srcChain);
    const destChainInfo = await this.getChainInfo(destChain);
    const routeDir = this.getRouteDir(srcChainInfo, destChainInfo);
    const _evmWalletDetails = evmWalletDetails || { useWindowEthereum: true };

    if (routeDir === RouteDir.COSMOS_TO_EVM) {
      return this.recoverCosmosToEvmTx(txHash, _evmWalletDetails, messageId);
    } else if (routeDir === RouteDir.EVM_TO_COSMOS) {
      return this.recoverEvmToCosmosTx(srcChain, txHash, eventIndex, _evmWalletDetails);
    } else if (routeDir === RouteDir.COSMOS_TO_COSMOS) {
      return this.recoverCosmosToCosmosTx(txHash);
    } else {
      return this.recoverEvmToEvmTx(
        srcChain,
        destChain,
        txHash,
        eventIndex,
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
    } else if (srcChain.module === "axelarnet" && destChain.module === "axelarnet") {
      return RouteDir.COSMOS_TO_COSMOS;
    } else {
      return RouteDir.EVM_TO_EVM;
    }
  }

  private async recoverCosmosToCosmosTx(txHash: string) {
    const gmpTx = await this.fetchGMPTransaction(txHash);

    // Fetch all necessary data to send the route message tx
    const payload = gmpTx.call.returnValues.payload;
    const messageId = gmpTx.call.id;

    // Send the route message tx
    const routeMessageTx = await this.routeMessageRequest(messageId, payload, -1).catch(
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
      routeMessageTx,
      infoLogs: [`Successfully sent RouteMessage tx for given tx hash ${txHash}`],
    };
  }

  private async recoverEvmToCosmosTx(
    srcChain: string,
    txHash: string,
    txEventIndex?: number | null,
    evmWalletDetails?: EvmWalletDetails
  ) {
    // Check if the tx is confirmed on the source chain
    const isConfirmed = await this.doesTxMeetConfirmHt(
      srcChain,
      txHash,
      evmWalletDetails?.provider
    );
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
    const eventIndex = txEventIndex ?? (await this.getEventIndex(srcChain as EvmChain, txHash));

    // Send the route message tx
    const routeMessageTx = await this.routeMessageRequest(txHash, payload, eventIndex).catch(
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

  private async recoverCosmosToEvmTx(
    txHash: string,
    evmWalletDetails: EvmWalletDetails,
    msgIdParam?: string
  ) {
    const txDetails = await this.fetchGMPTransaction(txHash);
    const {
      messageId: msgIdFromAxelarscan,
      payload,
      destinationChain,
    } = txDetails.call.returnValues;
    const { command_id: commandId } = txDetails;

    const messageId: string = msgIdParam ?? msgIdFromAxelarscan;

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
    txEventIndex: number | undefined,
    evmWalletDetails: EvmWalletDetails,
    escapeAfterConfirm = true
  ) {
    try {
      // ConfirmGatewayTx and check if it is successfully executed
      const confirmTxRequest = await this.findEventAndConfirmIfNeeded(
        srcChain,
        destChain,
        txHash,
        txEventIndex,
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
      const { signCommandTx, approveTx, infoLogs: signTxLogs } = response;
      return {
        success: true,
        confirmTx,
        signCommandTx,
        approveTx,
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
    } catch (e: any) {
      return {
        success: false,
        error: e.message || `Error signing and approving gateway for commandId: ${commandId}`,
      };
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
    estimatedGasUsed: number,
    options: QueryGasFeeOptions
  ): Promise<string> {
    await throwIfInvalidChainIds([sourceChain, destinationChain], this.environment);

    const hasTxBeenConfirmed = (await this.isConfirmed(txHash)) || false;
    options.shouldSubtractBaseFee = hasTxBeenConfirmed;

    return this.subtractGasFee(sourceChain, destinationChain, estimatedGasUsed, options);
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
    sourceChain: EvmChain,
    destinationChain: EvmChain,
    estimatedGasUsed: number,
    options: QueryGasFeeOptions
  ): Promise<string> {
    await throwIfInvalidChainIds([sourceChain, destinationChain], this.environment);

    return this.subtractGasFee(sourceChain, destinationChain, estimatedGasUsed, options);
  }

  public async getEventIndex(chain: string, txHash: string, evmWalletDetails?: EvmWalletDetails) {
    const signer = this.getSigner(chain, evmWalletDetails || { useWindowEthereum: false });
    const receipt = await signer.provider.getTransactionReceipt(txHash).catch(() => undefined);

    if (!receipt) {
      const gmpTx = await this.fetchGMPTransaction(txHash).catch(() => undefined);
      if (!gmpTx) return -1;

      return parseInt(gmpTx.call._logIndex);
    } else {
      const eventIndex = getEventIndexFromTxReceipt(receipt);
      return eventIndex;
    }
  }

  public async addGasToSuiChain(params: AddGasSuiParams): Promise<Transaction> {
    const { amount, messageId, gasParams, refundAddress } = params;
    const chains = await importS3Config(this.environment);
    const suiKey = Object.keys(chains.chains).find((chainName) => chainName.includes("sui"));

    if (!suiKey) throw new Error("Cannot find sui chain config");

    const suiConfig = chains.chains[suiKey];
    const gasServiceContract = suiConfig.config.contracts.GasService;

    const gasAmount = amount ? BigInt(amount) : parseUnits("0.01", 9).toBigInt();

    const tx = new Transaction();

    const [gas] = tx.splitCoins(tx.gas, [tx.pure.u64(gasAmount)]);

    tx.moveCall({
      target: `${gasServiceContract.address}::gas_service::add_gas`,
      typeArguments: [SUI_TYPE_ARG],
      arguments: [
        tx.object(gasServiceContract.objects.GasService),
        gas,
        tx.pure(bcs.string().serialize(messageId).toBytes()),
        tx.pure.address(refundAddress),
        tx.pure(bcs.vector(bcs.u8()).serialize(arrayify(gasParams)).toBytes()),
      ],
    });

    return tx;
  }
  /**
   * Builds an XDR transaction to add gas payment to the Axelar Gas Service contract.
   *
   * This function creates a Stellar transaction that adds gas payment to the Axelar Gas Service.
   * The payment is made in native XLM token by default and is used to cover the execution costs of
   * cross-chain messages.
   *
   * @example
   * ```typescript
   * const xdr = await sdk.addGasToStellarChain{
   *     senderAddress: 'GCXXX...', // The address that sent the cross-chain message via the `axelar_gateway`
   *     messageId: 'tx-123',
   *     amount: '10000000', // the token amount to pay for the gas fee
   *     spender: 'GXXX...' // The spender pays for the gas fee.
   * });
   *
   * // Sign with Freighter wallet
   * const signedXDR = await window.freighter.signTransaction(xdr);
   * ```
   *
   * @param {AddGasStellarParams} params - The parameters for the add gas transaction
   * @returns {Promise<string>} The transaction encoded as an XDR string, ready for signing
   */
  public async addGasToStellarChain(params: AddGasStellarParams): Promise<string> {
    const isDevnet = this.environment === Environment.DEVNET;

    // TODO: remove this once this supports on mainnet
    if (!isDevnet) throw new Error("This method only supports on devnet");

    const { senderAddress, messageId, contractAddress, tokenAddress, amount, spender } = params;

    // TODO: Replace with the value from the config file
    const contractId =
      contractAddress || "CDBPOARU5MFSC7ZWXTVPVKDZRHKOPS5RCY2VP2OKOBLCMQM3NKVP6HO7";

    const server = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org");

    // this will be StellarSdk.Networks.PUBLIC once mainnet is supported
    const networkPassphrase = StellarSdk.Networks.TESTNET;

    const caller = StellarSdk.nativeToScVal(StellarSdk.Address.fromString(senderAddress), {
      type: "address",
    });

    const contract = new StellarSdk.Contract(contractId);
    const nativeAssetAddress = StellarSdk.Asset.native().contractId(networkPassphrase);

    const operation = contract.call(
      "add_gas",
      caller,
      StellarSdk.nativeToScVal(messageId, { type: "string" }),
      StellarSdk.nativeToScVal(spender, { type: "address" }),
      tokenToScVal(tokenAddress || nativeAssetAddress, amount || "1")
    );

    const spenderAccount = await server.getAccount(spender);
    const transaction = new StellarSdk.TransactionBuilder(spenderAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    return transaction.toXDR();
  }

  public async addGasToCosmosChain({
    gasLimit,
    autocalculateGasOptions,
    sendOptions,
    ...params
  }: AddGasParams): Promise<AddGasResponse> {
    const chainConfigs = await this.getStaticInfo();
    let chainConfig;
    Object.keys(chainConfigs.chains).forEach((key: string) => {
      const potentialConfig = chainConfigs.chains[key];
      if (potentialConfig.id === params.chain) {
        chainConfig = potentialConfig;
      }
    });

    if (!chainConfig) {
      throw new Error(`chain ID ${params.chain} not found`);
    }

    const { rpc, channelIdToAxelar } = chainConfig;

    const tx = await this.fetchGMPTransaction(params.txHash);

    if (!tx) {
      return {
        success: false,
        info: `${params.txHash} could not be found`,
      };
    }

    const denom = tx.gas_paid?.returnValues?.asset;

    const denomOnSrcChain = getIBCDenomOnSrcChain(denom, chainConfig, chainConfigs);

    if (!matchesOriginalTokenPayment(params.token, denomOnSrcChain)) {
      return {
        success: false,
        info: `The token you are trying to send does not match the token originally \
          used for gas payment. Please send ${denom} instead`,
      };
    }

    const coin =
      params.token !== "autocalculate"
        ? params.token
        : {
            denom: denomOnSrcChain,
            amount: await this.axelarQueryApi.estimateGasFee(
              tx.call.chain,
              tx.call.returnValues.destinationChain,
              gasLimit,
              autocalculateGasOptions?.gasMultipler,
              denom ?? "uaxl"
            ),
          };

    const sender = await sendOptions.offlineSigner.getAccounts().then(([acc]: any) => acc?.address);

    if (!sender) {
      return {
        success: false,
        info: `Could not find sender from designated offlineSigner`,
      };
    }

    const rpcUrl = sendOptions.rpcUrl ?? rpc[0];

    if (!rpcUrl) {
      return {
        success: false,
        info: "Missing RPC URL. Please pass in an rpcUrl parameter in the sendOptions parameter",
      };
    }

    const signer = await getCosmosSigner(rpcUrl, sendOptions.offlineSigner);

    const broadcastResult = await signer.signAndBroadcast(
      sender,
      [
        {
          typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
          value: {
            sourcePort: "transfer",
            sourceChannel: channelIdToAxelar,
            token: coin,
            sender,
            receiver: COSMOS_GAS_RECEIVER_OPTIONS[this.environment],
            timeoutTimestamp: sendOptions.timeoutTimestamp ?? (Date.now() + 90) * 1e9,
            memo: tx.call.id,
          },
        },
      ],
      sendOptions.txFee
    );

    return {
      success: true,
      info: "",
      broadcastResult,
    };
  }

  /**
   * Pay native token as gas fee for the given transaction hash.
   * If the transaction details is not valid, it will return an error with reason.
   * @param chain - source chain
   * @param txHash - transaction hash
   * @param estimatedGasUsed - estimated gas used
   * @param options - options
   * @returns
   */
  public async addNativeGas(
    chain: EvmChain | string,
    txHash: string,
    estimatedGasUsed: number,
    options?: AddGasOptions
  ): Promise<TxResult> {
    const evmWalletDetails = options?.evmWalletDetails || { useWindowEthereum: true };
    const selectedChain = await this.getChainInfo(chain);

    if (!evmWalletDetails.rpcUrl) evmWalletDetails.rpcUrl = selectedChain.rpc[0];

    const signer = this.getSigner(chain, evmWalletDetails);
    const signerAddress = await signer.getAddress();

    const gasReceiverAddress = await this.axelarQueryApi.getContractAddressFromConfig(
      chain,
      "gas_service"
    );

    const { logIndex, destinationChain } = await this._getLogIndexAndDestinationChain(
      chain,
      txHash,
      options
    );

    if (!logIndex && !destinationChain) {
      return InvalidTransactionError(chain);
    }

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
        estimatedGasUsed,
        {
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
    estimatedGasUsed: number,
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

    const destinationChain = options?.destChain || getDestinationChainFromTxReceipt(receipt);
    const logIndex = options?.logIndex ?? getLogIndexFromTxReceipt(receipt);

    // Check if given txHash is valid
    if (!destinationChain) return NotGMPTransactionError();

    // Check if the transaction status is already executed or not.
    const _isExecuted = await this.isExecuted(txHash);
    if (_isExecuted) return AlreadyExecutedError();

    let gasFeeToAdd = options?.amount;

    if (!gasFeeToAdd) {
      gasFeeToAdd = await this.calculateGasFee(
        chain,
        destinationChain as EvmChain,
        estimatedGasUsed,
        {
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

    const signer = this.getSigner(
      destinationChain,
      evmWalletDetails || { useWindowEthereum: true }
    );
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

    return txResult;
  }

  private async subtractGasFee(
    sourceChain: string,
    destinationChain: string,
    estimatedGas: number,
    options: QueryGasFeeOptions
  ) {
    const totalGasFee = await this.axelarQueryApi.estimateGasFee(
      sourceChain,
      destinationChain,
      estimatedGas,
      options.gasMultipler,
      options.gasTokenSymbol,
      undefined,
      undefined
    );

    let topupGasAmount = ethers.BigNumber.from(totalGasFee);
    if (options.shouldSubtractBaseFee) {
      const response = await this.axelarQueryApi
        .getNativeGasBaseFee(sourceChain, destinationChain)
        .catch(() => undefined);
      if (response && response.baseFee) {
        topupGasAmount = topupGasAmount.sub(response.baseFee);
      }
    }
    return topupGasAmount.gt(0) ? topupGasAmount.toString() : "0";
  }

  private async _getLogIndexAndDestinationChain(
    chain: string,
    txHash: string,
    options?: AddGasOptions
  ): Promise<{ logIndex?: number; destinationChain?: string }> {
    const evmWalletDetails = options?.evmWalletDetails || { useWindowEthereum: true };
    const signer = this.getSigner(chain, evmWalletDetails);
    const gmpTx = await this.fetchGMPTransaction(txHash, options?.logIndex);

    let logIndex = options?.logIndex;
    let destinationChain = options?.destChain;

    if (!destinationChain || !logIndex) {
      if (!gmpTx) {
        const receipt = await signer.provider.getTransactionReceipt(txHash).catch(() => undefined);

        if (!receipt) return {};

        destinationChain = options?.destChain || getDestinationChainFromTxReceipt(receipt);
        logIndex = options?.logIndex ?? getLogIndexFromTxReceipt(receipt);
      } else {
        logIndex = gmpTx.call.eventIndex;
        destinationChain = gmpTx.call.returnValues.destinationChain;
      }
    }

    return { logIndex, destinationChain };
  }

  private getSigner(
    chain: string,
    evmWalletDetails: EvmWalletDetails = { useWindowEthereum: true }
  ) {
    const { rpcMap, networkInfo } = rpcInfo[this.environment];
    const evmClientConfig: EVMClientConfig = {
      rpcUrl: evmWalletDetails.rpcUrl || rpcMap[chain],
      networkOptions: networkInfo[chain],
      evmWalletDetails,
    };
    const evmClient = new EVMClient(evmClientConfig);
    return evmClient.getSigner();
  }

  async getStaticInfo(): Promise<Record<string, any>> {
    if (!this.staticInfo) {
      this.staticInfo = await fetch(s3[this.environment])
        .then((res) => res.json())
        .catch(() => undefined);
    }
    return this.staticInfo;
  }
}
