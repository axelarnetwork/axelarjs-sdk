"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxelarGMPRecoveryAPI = exports.getCosmosSigner = exports.RouteDir = exports.GMPErrorMap = void 0;
const types_1 = require("../types");
const AxelarRecoveryApi_1 = require("./AxelarRecoveryApi");
const EVMClient_1 = __importDefault(require("./client/EVMClient"));
const IAxelarExecutable_1 = __importDefault(require("../abi/IAxelarExecutable"));
const ethers_1 = require("ethers");
const AxelarQueryAPI_1 = require("../AxelarQueryAPI");
const chain_1 = __importDefault(require("./constants/chain"));
const contractEventHelper_1 = require("./helpers/contractEventHelper");
const erc20Abi_json_1 = __importDefault(require("../abi/erc20Abi.json"));
const AxelarGateway_1 = require("../AxelarGateway");
const utils_1 = require("@mysten/sui/utils");
const transactions_1 = require("@mysten/sui/transactions");
const bcs_1 = require("@mysten/sui/bcs");
const error_1 = require("./constants/error");
const helpers_1 = require("./helpers");
const utils_2 = require("../../utils");
const types_2 = require("@axelar-network/axelarjs-types/axelar/evm/v1beta1/types");
const utils_3 = require("ethers/lib/utils");
const s3_1 = __importDefault(require("./constants/s3"));
const stargate_1 = require("@cosmjs/stargate");
const cosmosGasReceiverOptions_1 = require("./constants/cosmosGasReceiverOptions");
const chains_1 = require("../../chains");
const StellarSdk = __importStar(require("@stellar/stellar-sdk"));
const stellarHelper_1 = require("./helpers/stellarHelper");
exports.GMPErrorMap = {
    [AxelarRecoveryApi_1.GMPStatus.CANNOT_FETCH_STATUS]: types_1.ApproveGatewayError.FETCHING_STATUS_FAILED,
    [AxelarRecoveryApi_1.GMPStatus.DEST_EXECUTED]: types_1.ApproveGatewayError.ALREADY_EXECUTED,
    [AxelarRecoveryApi_1.GMPStatus.DEST_GATEWAY_APPROVED]: types_1.ApproveGatewayError.ALREADY_APPROVED,
};
var RouteDir;
(function (RouteDir) {
    RouteDir["COSMOS_TO_EVM"] = "cosmos_to_evm";
    RouteDir["EVM_TO_COSMOS"] = "evm_to_cosmos";
    RouteDir["EVM_TO_EVM"] = "evm_to_evm";
    RouteDir["COSMOS_TO_COSMOS"] = "cosmos_to_cosmos";
})(RouteDir || (exports.RouteDir = RouteDir = {}));
const getCosmosSigner = (rpcUrl, offlineDirectSigner) => __awaiter(void 0, void 0, void 0, function* () {
    return stargate_1.SigningStargateClient.connectWithSigner(rpcUrl, offlineDirectSigner);
});
exports.getCosmosSigner = getCosmosSigner;
function matchesOriginalTokenPayment(token, denomOnSrcChain) {
    return token === "autocalculate" || (token === null || token === void 0 ? void 0 : token.denom) === denomOnSrcChain;
}
function getIBCDenomOnSrcChain(denomOnAxelar, selectedChain, chainConfigs) {
    const asset = chainConfigs["assets"][denomOnAxelar !== null && denomOnAxelar !== void 0 ? denomOnAxelar : "uaxl"];
    const assetOnSrcChain = asset["chain_aliases"][selectedChain.chainName.toLowerCase()];
    const ibcDenom = assetOnSrcChain === null || assetOnSrcChain === void 0 ? void 0 : assetOnSrcChain.ibcDenom;
    if (!ibcDenom) {
        throw new Error("cannot find token that matches original gas payment");
    }
    return ibcDenom;
}
class AxelarGMPRecoveryAPI extends AxelarRecoveryApi_1.AxelarRecoveryApi {
    constructor(config) {
        super(config);
        this.axelarQueryApi = new AxelarQueryAPI_1.AxelarQueryAPI({
            environment: config.environment,
            axelarRpcUrl: this.axelarRpcUrl,
            axelarLcdUrl: this.axelarLcdUrl,
        });
    }
    getCidFromSrcTxHash(destChainId, messageId, eventIndex) {
        var _a;
        const chainId = (_a = chain_1.default[this.environment].networkInfo[destChainId.toLowerCase()]) === null || _a === void 0 ? void 0 : _a.chainId;
        return (0, helpers_1.getCommandId)(messageId, eventIndex, chainId);
    }
    doesTxMeetConfirmHt(chain, txHash, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const confirmations = yield this.getSigner(chain, { useWindowEthereum: false, provider })
                .provider.getTransactionReceipt(txHash)
                .then((receipt) => __awaiter(this, void 0, void 0, function* () {
                if (!receipt) {
                    const gmpTx = yield this.fetchGMPTransaction(txHash);
                    const currentBlock = yield this.getSigner(chain, {
                        useWindowEthereum: false,
                        provider,
                    }).provider.getBlockNumber();
                    return currentBlock - gmpTx.call.blockNumber;
                }
                return receipt.confirmations;
            }));
            return this.axelarQueryApi
                .getConfirmationHeight(chain)
                .then((minConfirmHeight) => minConfirmHeight <= confirmations)
                .catch(() => undefined);
        });
    }
    isEVMEventFailed(eventResponse) {
        var _a;
        if (!eventResponse)
            return undefined;
        return [types_2.Event_Status.STATUS_FAILED, types_2.Event_Status.STATUS_UNSPECIFIED].includes((_a = eventResponse.event) === null || _a === void 0 ? void 0 : _a.status);
    }
    isEVMEventConfirmed(eventResponse) {
        var _a;
        if (!eventResponse)
            return undefined;
        return ((_a = eventResponse.event) === null || _a === void 0 ? void 0 : _a.status) === types_2.Event_Status.STATUS_CONFIRMED;
    }
    isEVMEventCompleted(eventResponse) {
        var _a;
        if (!eventResponse)
            return undefined;
        return ((_a = eventResponse.event) === null || _a === void 0 ? void 0 : _a.status) === types_2.Event_Status.STATUS_COMPLETED;
    }
    getEvmEvent(srcChainId, destChainId, srcTxHash, srcTxEventIndex, evmWalletDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const eventIndex = srcTxEventIndex !== null && srcTxEventIndex !== void 0 ? srcTxEventIndex : (yield this.getEventIndex(srcChainId, srcTxHash, evmWalletDetails)
                .then((index) => index)
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
            const eventResponse = yield this.axelarQueryApi.getEVMEvent(srcChainId, srcTxHash, eventIndex);
            const isCallContract = ((_a = eventResponse === null || eventResponse === void 0 ? void 0 : eventResponse.event) === null || _a === void 0 ? void 0 : _a.contractCall) ? true : false;
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
        });
    }
    findEventAndConfirmIfNeeded(srcChain, destChain, txHash, txEventIndex, evmWalletDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.debugMode)
                console.debug(`confirmation: checking whether ${txHash} needs to be confirmed on Axelar`);
            const evmEvent = yield this.getEvmEvent(srcChain, destChain, txHash, txEventIndex);
            const { infoLog: getEvmEventInfoLog } = evmEvent;
            if (this.debugMode)
                console.debug(`confirmation: ${getEvmEventInfoLog}`);
            if (this.isEVMEventCompleted(evmEvent.eventResponse) ||
                this.isEVMEventConfirmed(evmEvent.eventResponse)) {
                return {
                    success: true,
                    commandId: evmEvent.commandId,
                    eventResponse: evmEvent.eventResponse,
                    infoLogs: [
                        `confirmation: event for ${txHash} was already detected on the network and did not need to be confirmed`,
                    ],
                };
            }
            else {
                const isConfirmFinalized = yield this.doesTxMeetConfirmHt(srcChain, txHash, evmWalletDetails.provider);
                if (!isConfirmFinalized) {
                    const minConfirmLevel = yield this.axelarQueryApi.getConfirmationHeight(srcChain);
                    return {
                        success: false,
                        commandId: evmEvent.commandId,
                        eventResponse: evmEvent.eventResponse,
                        infoLogs: [],
                        errorMessage: `findEventAndConfirmIfNeeded(): ${txHash} is not confirmed on ${srcChain}. The minimum confirmation height is ${minConfirmLevel}`,
                    };
                }
                const confirmTx = yield this.confirmGatewayTx(txHash, srcChain).catch(() => undefined);
                if (!confirmTx) {
                    return {
                        success: false,
                        commandId: evmEvent.commandId,
                        eventResponse: evmEvent.eventResponse,
                        infoLogs: [],
                        errorMessage: `findEventAndConfirmIfNeeded(): could not confirm transaction on Axelar`,
                    };
                }
                const updatedEvent = yield this.getEvmEvent(srcChain, destChain, txHash, txEventIndex, evmWalletDetails);
                if (this.isEVMEventCompleted(updatedEvent === null || updatedEvent === void 0 ? void 0 : updatedEvent.eventResponse)) {
                    return {
                        success: true,
                        commandId: updatedEvent.commandId,
                        eventResponse: updatedEvent.eventResponse,
                        infoLogs: [
                            `confirmation: successfully confirmed ${txHash} on Axelar; confirmed event was finalized`,
                            getEvmEventInfoLog,
                        ],
                    };
                }
                else {
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
        });
    }
    findBatchAndSignIfNeeded(commandId, destChainId) {
        return __awaiter(this, void 0, void 0, function* () {
            let signTxLog = "";
            try {
                const batchData = yield (0, utils_2.retry)(() => this.fetchBatchData(destChainId, commandId), 10, 3000);
                if (batchData) {
                    signTxLog = `signing: batch data exists so do not need to sign. commandId: ${commandId}, batchId: ${batchData.batch_id}`;
                    if (this.debugMode)
                        console.debug(signTxLog);
                    return {
                        success: true,
                        infoLogs: [signTxLog],
                    };
                }
                else {
                    const signCommandTx = yield this.signCommands(destChainId);
                    signTxLog = `signing: signed batch for commandId (${commandId}) in tx: ${signCommandTx.transactionHash}`;
                    if (this.debugMode)
                        console.debug(signTxLog);
                    return {
                        success: true,
                        signCommandTx,
                        infoLogs: [signTxLog],
                    };
                }
            }
            catch (e) {
                return {
                    success: false,
                    errorMessage: `findBatchAndSignIfNeeded(): issue retrieving and signing command data: ${commandId}`,
                    infoLogs: [signTxLog],
                };
            }
        });
    }
    findBatchAndApproveGateway(commandId, destChainId, wallet) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.debugMode)
                console.debug(`broadcasting: checking for command ID: ${commandId} to broadcast`);
            return (0, utils_2.retry)(() => __awaiter(this, void 0, void 0, function* () {
                const batchData = yield this.fetchBatchData(destChainId, commandId);
                if (!batchData) {
                    return Promise.reject(`findBatchAndApproveGateway(): unable to retrieve batch data for ${commandId}`);
                }
                const commandData = batchData.command_ids.find((t) => t === commandId);
                if (!commandData) {
                    return Promise.reject(`findBatchAndApproveGateway(): unable to retrieve command ID (${commandId}) in batch data`);
                }
                if (batchData.status === "BATCHED_COMMANDS_STATUS_SIGNING") {
                    return Promise.reject(`findBatchAndApproveGateway(): batch ID ${batchData.batch_id} signing in process`);
                }
                else if (batchData.status === "BATCHED_COMMANDS_STATUS_SIGNED") {
                    const approveTx = yield this.sendApproveTx(destChainId, batchData.execute_data, wallet);
                    return {
                        success: true,
                        approveTx,
                        infoLogs: [
                            `broadcasting: batch ID ${batchData.batch_id} broadcasted to ${destChainId}`,
                        ],
                    };
                }
                else {
                    return Promise.reject(`findBatchAndApproveGateway(): batch ID ${batchData.batch_id} is in an unknown state for command data: ${commandId}`);
                }
            }), 3, 10).catch((error) => {
                return {
                    success: false,
                    errorMessage: error.message || // error can be both a string or an object with a message property
                        error ||
                        `findBatchAndApproveGatewayIfNeeded(): issue retrieving and broadcasting command data: ${commandId}`,
                    infoLogs: [],
                };
            });
        });
    }
    manualRelayToDestChain(txHash_1, txLogIndex_1, txEventIndex_1, evmWalletDetails_1) {
        return __awaiter(this, arguments, void 0, function* (txHash, txLogIndex, txEventIndex, evmWalletDetails, escapeAfterConfirm = true, messageId) {
            const { callTx, status } = yield this.queryTransactionStatus(txHash, txLogIndex);
            /**first check if transaction is already executed */
            if (exports.GMPErrorMap[status])
                return {
                    success: false,
                    error: exports.GMPErrorMap[status],
                };
            const srcChain = callTx.chain;
            const destChain = callTx.returnValues.destinationChain;
            const eventIndex = txEventIndex !== null && txEventIndex !== void 0 ? txEventIndex : callTx._logIndex;
            const srcChainInfo = yield this.getChainInfo(srcChain);
            const destChainInfo = yield this.getChainInfo(destChain);
            const routeDir = this.getRouteDir(srcChainInfo, destChainInfo);
            const _evmWalletDetails = evmWalletDetails || { useWindowEthereum: true };
            if (routeDir === RouteDir.COSMOS_TO_EVM) {
                return this.recoverCosmosToEvmTx(txHash, _evmWalletDetails, messageId);
            }
            else if (routeDir === RouteDir.EVM_TO_COSMOS) {
                return this.recoverEvmToCosmosTx(srcChain, txHash, eventIndex, _evmWalletDetails);
            }
            else if (routeDir === RouteDir.COSMOS_TO_COSMOS) {
                return this.recoverCosmosToCosmosTx(txHash);
            }
            else {
                return this.recoverEvmToEvmTx(srcChain, destChain, txHash, eventIndex, _evmWalletDetails, escapeAfterConfirm);
            }
        });
    }
    getRouteDir(srcChain, destChain) {
        if (srcChain.module === "axelarnet" && destChain.module === "evm") {
            return RouteDir.COSMOS_TO_EVM;
        }
        else if (srcChain.module === "evm" && destChain.module === "axelarnet") {
            return RouteDir.EVM_TO_COSMOS;
        }
        else if (srcChain.module === "axelarnet" && destChain.module === "axelarnet") {
            return RouteDir.COSMOS_TO_COSMOS;
        }
        else {
            return RouteDir.EVM_TO_EVM;
        }
    }
    recoverCosmosToCosmosTx(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const gmpTx = yield this.fetchGMPTransaction(txHash);
            // Fetch all necessary data to send the route message tx
            const payload = gmpTx.call.returnValues.payload;
            const messageId = gmpTx.call.id;
            // Send the route message tx
            const routeMessageTx = yield this.routeMessageRequest(messageId, payload, -1).catch(() => undefined);
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
        });
    }
    recoverEvmToCosmosTx(srcChain, txHash, txEventIndex, evmWalletDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the tx is confirmed on the source chain
            const isConfirmed = yield this.doesTxMeetConfirmHt(srcChain, txHash, evmWalletDetails === null || evmWalletDetails === void 0 ? void 0 : evmWalletDetails.provider);
            if (!isConfirmed) {
                const minConfirmLevel = yield this.axelarQueryApi.getConfirmationHeight(srcChain);
                return {
                    success: false,
                    error: `${txHash} is not confirmed on ${srcChain}. The minimum confirmation height is ${minConfirmLevel}`,
                };
            }
            // ConfirmGatewayTx and check if it is successfully executed
            const confirmTx = yield this.confirmGatewayTx(txHash, srcChain).catch(() => undefined);
            if (!confirmTx) {
                return {
                    success: false,
                    error: "Failed to send ConfirmGatewayTx to Axelar",
                };
            }
            // Fetch all necessary data to send the route message tx
            const payload = yield this.fetchGMPTransaction(txHash).then((data) => data.call.returnValues.payload);
            const eventIndex = txEventIndex !== null && txEventIndex !== void 0 ? txEventIndex : (yield this.getEventIndex(srcChain, txHash));
            // Send the route message tx
            const routeMessageTx = yield this.routeMessageRequest(txHash, payload, eventIndex).catch(() => undefined);
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
        });
    }
    recoverCosmosToEvmTx(txHash, evmWalletDetails, msgIdParam) {
        return __awaiter(this, void 0, void 0, function* () {
            const txDetails = yield this.fetchGMPTransaction(txHash);
            const { messageId: msgIdFromAxelarscan, payload, destinationChain, } = txDetails.call.returnValues;
            const { command_id: commandId } = txDetails;
            const messageId = msgIdParam !== null && msgIdParam !== void 0 ? msgIdParam : msgIdFromAxelarscan;
            // Send RouteMessageTx
            const routeMessageTx = yield this.routeMessageRequest(messageId, payload, -1).catch(() => undefined);
            if (!routeMessageTx) {
                return {
                    success: false,
                    error: "Failed to send RouteMessage to Axelar",
                };
            }
            // Dispatch a SignCommand transaction and an Approve transaction to the Gateway contract.
            const response = yield this.signAndApproveGateway(commandId, destinationChain, evmWalletDetails);
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
        });
    }
    recoverEvmToEvmTx(srcChain_1, destChain_1, txHash_1, txEventIndex_1, evmWalletDetails_1) {
        return __awaiter(this, arguments, void 0, function* (srcChain, destChain, txHash, txEventIndex, evmWalletDetails, escapeAfterConfirm = true) {
            try {
                // ConfirmGatewayTx and check if it is successfully executed
                const confirmTxRequest = yield this.findEventAndConfirmIfNeeded(srcChain, destChain, txHash, txEventIndex, evmWalletDetails);
                // If the `success` flag is false, we will return the error response
                if (!(confirmTxRequest === null || confirmTxRequest === void 0 ? void 0 : confirmTxRequest.success)) {
                    return {
                        success: false,
                        error: confirmTxRequest.errorMessage || types_1.ApproveGatewayError.ERROR_BATCHED_COMMAND,
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
                const response = yield this.signAndApproveGateway(commandId, destChain, evmWalletDetails);
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
            }
            catch (e) {
                return {
                    success: false,
                    error: e.message || types_1.ApproveGatewayError.CONFIRM_COMMAND_FAILED,
                };
            }
        });
    }
    signAndApproveGateway(commandId, destChain, evmWalletDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const signTxRequest = yield this.findBatchAndSignIfNeeded(commandId, destChain);
                if (!(signTxRequest === null || signTxRequest === void 0 ? void 0 : signTxRequest.success)) {
                    return {
                        success: false,
                        error: signTxRequest.errorMessage || types_1.ApproveGatewayError.SIGN_COMMAND_FAILED,
                    };
                }
                const broadcastTxRequest = yield this.findBatchAndApproveGateway(commandId, destChain, evmWalletDetails);
                if (!(broadcastTxRequest === null || broadcastTxRequest === void 0 ? void 0 : broadcastTxRequest.success)) {
                    return {
                        success: false,
                        error: broadcastTxRequest.errorMessage || types_1.ApproveGatewayError.ERROR_BROADCAST_EVENT,
                    };
                }
                return {
                    success: true,
                    signCommandTx: signTxRequest.signCommandTx,
                    approveTx: broadcastTxRequest.approveTx,
                    infoLogs: [...(signTxRequest.infoLogs || []), ...(broadcastTxRequest.infoLogs || [])],
                };
            }
            catch (e) {
                return {
                    success: false,
                    error: e.message || `Error signing and approving gateway for commandId: ${commandId}`,
                };
            }
        });
    }
    /**
     * Check if given transaction is already executed.
     * @param txHash string - transaction hash
     * @returns Promise<boolean> - true if transaction is already executed
     */
    isExecuted(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const txStatus = yield this.queryTransactionStatus(txHash).catch(() => undefined);
            return (txStatus === null || txStatus === void 0 ? void 0 : txStatus.status) === AxelarRecoveryApi_1.GMPStatus.DEST_EXECUTED;
        });
    }
    /**
     * Check if given transaction is already confirmed.
     * @param txHash string - transaction hash
     * @returns Promise<boolean> - true if transaction is already confirmed
     */
    isConfirmed(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const txStatus = yield this.queryTransactionStatus(txHash).catch(() => undefined);
            return [AxelarRecoveryApi_1.GMPStatus.SRC_GATEWAY_CONFIRMED, AxelarRecoveryApi_1.GMPStatus.DEST_GATEWAY_APPROVED].includes(this.parseGMPStatus(txStatus === null || txStatus === void 0 ? void 0 : txStatus.status));
        });
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
    calculateNativeGasFee(txHash, sourceChain, destinationChain, estimatedGasUsed, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_2.throwIfInvalidChainIds)([sourceChain, destinationChain], this.environment);
            const hasTxBeenConfirmed = (yield this.isConfirmed(txHash)) || false;
            options.shouldSubtractBaseFee = hasTxBeenConfirmed;
            return this.subtractGasFee(sourceChain, destinationChain, estimatedGasUsed, options);
        });
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
    calculateGasFee(sourceChain, destinationChain, estimatedGasUsed, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_2.throwIfInvalidChainIds)([sourceChain, destinationChain], this.environment);
            return this.subtractGasFee(sourceChain, destinationChain, estimatedGasUsed, options);
        });
    }
    getEventIndex(chain, txHash, evmWalletDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = this.getSigner(chain, evmWalletDetails || { useWindowEthereum: false });
            const receipt = yield signer.provider.getTransactionReceipt(txHash).catch(() => undefined);
            if (!receipt) {
                const gmpTx = yield this.fetchGMPTransaction(txHash).catch(() => undefined);
                if (!gmpTx)
                    return -1;
                return parseInt(gmpTx.call._logIndex);
            }
            else {
                const eventIndex = (0, contractEventHelper_1.getEventIndexFromTxReceipt)(receipt);
                return eventIndex;
            }
        });
    }
    addGasToSuiChain(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { amount, messageId, gasParams, refundAddress } = params;
            const chains = yield (0, chains_1.importS3Config)(this.environment);
            const suiKey = Object.keys(chains.chains).find((chainName) => chainName.includes("sui"));
            if (!suiKey)
                throw new Error("Cannot find sui chain config");
            const suiConfig = chains.chains[suiKey];
            const gasServiceContract = suiConfig.config.contracts.GasService;
            const gasAmount = amount ? BigInt(amount) : (0, utils_3.parseUnits)("0.01", 9).toBigInt();
            const tx = new transactions_1.Transaction();
            const [gas] = tx.splitCoins(tx.gas, [tx.pure.u64(gasAmount)]);
            tx.moveCall({
                target: `${gasServiceContract.address}::gas_service::add_gas`,
                typeArguments: [utils_1.SUI_TYPE_ARG],
                arguments: [
                    tx.object(gasServiceContract.objects.GasService),
                    gas,
                    tx.pure(bcs_1.bcs.string().serialize(messageId).toBytes()),
                    tx.pure.address(refundAddress),
                    tx.pure(bcs_1.bcs.vector(bcs_1.bcs.u8()).serialize((0, utils_3.arrayify)(gasParams)).toBytes()),
                ],
            });
            return tx;
        });
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
    addGasToStellarChain(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const isDevnet = this.environment === types_1.Environment.DEVNET;
            // TODO: remove this once this supports on mainnet
            if (!isDevnet)
                throw new Error("This method only supports on devnet");
            const { senderAddress, messageId, contractAddress, tokenAddress, amount, spender } = params;
            // TODO: Replace with the value from the config file
            const contractId = contractAddress || "CDBPOARU5MFSC7ZWXTVPVKDZRHKOPS5RCY2VP2OKOBLCMQM3NKVP6HO7";
            const server = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org");
            // this will be StellarSdk.Networks.PUBLIC once mainnet is supported
            const networkPassphrase = StellarSdk.Networks.TESTNET;
            const caller = StellarSdk.nativeToScVal(StellarSdk.Address.fromString(senderAddress), {
                type: "address",
            });
            const contract = new StellarSdk.Contract(contractId);
            const nativeAssetAddress = StellarSdk.Asset.native().contractId(networkPassphrase);
            const operation = contract.call("add_gas", caller, StellarSdk.nativeToScVal(messageId, { type: "string" }), StellarSdk.nativeToScVal(spender, { type: "address" }), (0, stellarHelper_1.tokenToScVal)(tokenAddress || nativeAssetAddress, amount || "1"));
            const spenderAccount = yield server.getAccount(spender);
            const transaction = new StellarSdk.TransactionBuilder(spenderAccount, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase,
            })
                .addOperation(operation)
                .setTimeout(30)
                .build();
            return transaction.toXDR();
        });
    }
    addGasToCosmosChain(_a) {
        return __awaiter(this, void 0, void 0, function* () {
            var _b, _c, _d;
            var { gasLimit, autocalculateGasOptions, sendOptions } = _a, params = __rest(_a, ["gasLimit", "autocalculateGasOptions", "sendOptions"]);
            const chainConfigs = yield this.getStaticInfo();
            let chainConfig;
            Object.keys(chainConfigs.chains).forEach((key) => {
                const potentialConfig = chainConfigs.chains[key];
                if (potentialConfig.id === params.chain) {
                    chainConfig = potentialConfig;
                }
            });
            if (!chainConfig) {
                throw new Error(`chain ID ${params.chain} not found`);
            }
            const { rpc, channelIdToAxelar } = chainConfig;
            const tx = yield this.fetchGMPTransaction(params.txHash);
            if (!tx) {
                return {
                    success: false,
                    info: `${params.txHash} could not be found`,
                };
            }
            const denom = (_c = (_b = tx.gas_paid) === null || _b === void 0 ? void 0 : _b.returnValues) === null || _c === void 0 ? void 0 : _c.asset;
            const denomOnSrcChain = getIBCDenomOnSrcChain(denom, chainConfig, chainConfigs);
            if (!matchesOriginalTokenPayment(params.token, denomOnSrcChain)) {
                return {
                    success: false,
                    info: `The token you are trying to send does not match the token originally \
          used for gas payment. Please send ${denom} instead`,
                };
            }
            const coin = params.token !== "autocalculate"
                ? params.token
                : {
                    denom: denomOnSrcChain,
                    amount: yield this.axelarQueryApi.estimateGasFee(tx.call.chain, tx.call.returnValues.destinationChain, gasLimit, autocalculateGasOptions === null || autocalculateGasOptions === void 0 ? void 0 : autocalculateGasOptions.gasMultipler, denom !== null && denom !== void 0 ? denom : "uaxl"),
                };
            const sender = yield sendOptions.offlineSigner.getAccounts().then(([acc]) => acc === null || acc === void 0 ? void 0 : acc.address);
            if (!sender) {
                return {
                    success: false,
                    info: `Could not find sender from designated offlineSigner`,
                };
            }
            const rpcUrl = (_d = sendOptions.rpcUrl) !== null && _d !== void 0 ? _d : rpc[0];
            if (!rpcUrl) {
                return {
                    success: false,
                    info: "Missing RPC URL. Please pass in an rpcUrl parameter in the sendOptions parameter",
                };
            }
            const signer = yield (0, exports.getCosmosSigner)(rpcUrl, sendOptions.offlineSigner);
            const broadcastResult = yield signer.signAndBroadcast(sender, [
                {
                    typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
                    value: {
                        sourcePort: "transfer",
                        sourceChannel: channelIdToAxelar,
                        token: coin,
                        sender,
                        receiver: cosmosGasReceiverOptions_1.COSMOS_GAS_RECEIVER_OPTIONS[this.environment],
                        timeoutTimestamp: sendOptions.timeoutTimestamp ? BigInt(sendOptions.timeoutTimestamp) : BigInt((Date.now() + 90) * 1e9),
                        memo: tx.call.id,
                    },
                },
            ], sendOptions.txFee);
            return {
                success: true,
                info: "",
                broadcastResult,
            };
        });
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
    addNativeGas(chain, txHash, estimatedGasUsed, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const evmWalletDetails = (options === null || options === void 0 ? void 0 : options.evmWalletDetails) || { useWindowEthereum: true };
            const selectedChain = yield this.getChainInfo(chain);
            if (!evmWalletDetails.rpcUrl)
                evmWalletDetails.rpcUrl = selectedChain.rpc[0];
            const signer = this.getSigner(chain, evmWalletDetails);
            const signerAddress = yield signer.getAddress();
            const gasReceiverAddress = yield this.axelarQueryApi.getContractAddressFromConfig(chain, "gas_service");
            const { logIndex, destinationChain } = yield this._getLogIndexAndDestinationChain(chain, txHash, options);
            if (!logIndex && !destinationChain) {
                return (0, error_1.InvalidTransactionError)(chain);
            }
            if (!destinationChain)
                return (0, error_1.NotGMPTransactionError)();
            // Check if the transaction status is already executed or not.
            const _isExecuted = yield this.isExecuted(txHash);
            if (_isExecuted)
                return (0, error_1.AlreadyExecutedError)();
            let gasFeeToAdd = options === null || options === void 0 ? void 0 : options.amount;
            if (!gasFeeToAdd) {
                gasFeeToAdd = yield this.calculateNativeGasFee(txHash, chain, destinationChain, estimatedGasUsed, {
                    gasMultipler: options === null || options === void 0 ? void 0 : options.gasMultipler,
                    provider: evmWalletDetails.provider,
                }).catch(() => undefined);
            }
            // Check if gas price is queried successfully.
            if (!gasFeeToAdd)
                return (0, error_1.GasPriceAPIError)();
            // Check if gas fee is not already sufficiently paid.
            if (gasFeeToAdd === "0")
                return (0, error_1.AlreadyPaidGasFeeError)();
            const refundAddress = (options === null || options === void 0 ? void 0 : options.refundAddress) || signerAddress;
            const contract = new ethers_1.ethers.Contract(gasReceiverAddress, [
                "function addNativeGas(bytes32 txHash,uint256 logIndex,address refundAddress) external payable",
            ], signer);
            return contract
                .addNativeGas(txHash, logIndex, refundAddress, {
                value: gasFeeToAdd,
            })
                .then((tx) => tx.wait())
                .then((tx) => ({
                success: true,
                transaction: tx,
            }))
                .catch(error_1.ContractCallError);
        });
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
    addGas(chain, txHash, gasTokenAddress, estimatedGasUsed, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const evmWalletDetails = (options === null || options === void 0 ? void 0 : options.evmWalletDetails) || { useWindowEthereum: true };
            const signer = this.getSigner(chain, evmWalletDetails);
            const signerAddress = yield signer.getAddress();
            const gasReceiverAddress = yield this.axelarQueryApi.getContractAddressFromConfig(chain, "gas_service");
            const gasTokenContract = new ethers_1.ethers.Contract(gasTokenAddress, erc20Abi_json_1.default, signer.provider);
            const gasTokenSymbol = yield gasTokenContract.symbol().catch(() => undefined);
            // Check if given `gasTokenAddress` exists
            if (!gasTokenSymbol)
                return (0, error_1.InvalidGasTokenError)();
            const axelarGateway = yield AxelarGateway_1.AxelarGateway.create(this.environment, chain, signer.provider);
            const gatewayGasTokenAddress = yield axelarGateway.getTokenAddress(gasTokenSymbol);
            // Check if given `gasTokenAddress` is supported by Axelar.
            if (gatewayGasTokenAddress === ethers_1.ethers.constants.AddressZero)
                return (0, error_1.UnsupportedGasTokenError)(gasTokenAddress);
            const receipt = yield signer.provider.getTransactionReceipt(txHash);
            // Check if transaction exists
            if (!receipt)
                return (0, error_1.InvalidTransactionError)(chain);
            const destinationChain = (options === null || options === void 0 ? void 0 : options.destChain) || (0, contractEventHelper_1.getDestinationChainFromTxReceipt)(receipt);
            const logIndex = (_a = options === null || options === void 0 ? void 0 : options.logIndex) !== null && _a !== void 0 ? _a : (0, contractEventHelper_1.getLogIndexFromTxReceipt)(receipt);
            // Check if given txHash is valid
            if (!destinationChain)
                return (0, error_1.NotGMPTransactionError)();
            // Check if the transaction status is already executed or not.
            const _isExecuted = yield this.isExecuted(txHash);
            if (_isExecuted)
                return (0, error_1.AlreadyExecutedError)();
            let gasFeeToAdd = options === null || options === void 0 ? void 0 : options.amount;
            if (!gasFeeToAdd) {
                gasFeeToAdd = yield this.calculateGasFee(chain, destinationChain, estimatedGasUsed, {
                    provider: evmWalletDetails.provider,
                }).catch(() => undefined);
            }
            // Check if gas price is queried successfully.
            if (!gasFeeToAdd)
                return (0, error_1.GasPriceAPIError)();
            // Check if gas fee is not already sufficiently paid.
            if (gasFeeToAdd === "0")
                return (0, error_1.AlreadyPaidGasFeeError)();
            const refundAddress = (options === null || options === void 0 ? void 0 : options.refundAddress) || signerAddress;
            const contract = new ethers_1.ethers.Contract(gasReceiverAddress, new utils_3.Interface([
                "function addGas(bytes32 txHash,uint256 txIndex,address gasToken,uint256 gasFeeAmount,address refundAddress) external",
            ]), signer);
            return contract
                .addGas(txHash, logIndex, gasTokenAddress, gasFeeToAdd, refundAddress)
                .then((tx) => tx.wait())
                .then((tx) => ({
                success: true,
                transaction: tx,
            }))
                .catch(error_1.ContractCallError);
        });
    }
    /**
     * Execute a transaction on the destination chain associated with given `srcTxHash`.
     * @param srcTxHash - The transaction hash on the source chain.
     * @param srcTxLogIndex - The log index of the transaction on the source chain.
     * @param evmWalletDetails - The wallet details to use for executing the transaction.
     * @returns The result of executing the transaction.
     */
    execute(srcTxHash, srcTxLogIndex, evmWalletDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.queryExecuteParams(srcTxHash, srcTxLogIndex).catch(() => undefined);
            // Couldn't query the transaction details
            if (!response)
                return (0, error_1.GMPQueryError)();
            // Already executed
            if ((response === null || response === void 0 ? void 0 : response.status) === AxelarRecoveryApi_1.GMPStatus.DEST_EXECUTED)
                return (0, error_1.AlreadyExecutedError)();
            // Not Approved yet
            if ((response === null || response === void 0 ? void 0 : response.status) !== AxelarRecoveryApi_1.GMPStatus.DEST_GATEWAY_APPROVED)
                return (0, error_1.NotApprovedError)();
            const executeParams = response.data;
            const gasLimitBuffer = (evmWalletDetails === null || evmWalletDetails === void 0 ? void 0 : evmWalletDetails.gasLimitBuffer) || 0;
            const { destinationChain, destinationContractAddress } = executeParams;
            const signer = this.getSigner(destinationChain, evmWalletDetails || { useWindowEthereum: true });
            const contract = new ethers_1.ethers.Contract(destinationContractAddress, IAxelarExecutable_1.default.abi, signer);
            const txResult = yield (0, helpers_1.callExecute)(executeParams, contract, gasLimitBuffer)
                .then((tx) => {
                const { commandId, sourceChain, sourceAddress, payload, symbol, amount, isContractCallWithToken, } = executeParams;
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
                .catch((e) => {
                if (e.message === helpers_1.CALL_EXECUTE_ERROR.INSUFFICIENT_FUNDS) {
                    return (0, error_1.InsufficientFundsError)(executeParams);
                }
                else if (e.message === helpers_1.CALL_EXECUTE_ERROR.REVERT) {
                    return (0, error_1.ExecutionRevertedError)(executeParams);
                }
                else {
                    // should not happen
                    return (0, error_1.ContractCallError)(e);
                }
            });
            return txResult;
        });
    }
    subtractGasFee(sourceChain, destinationChain, estimatedGas, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalGasFee = yield this.axelarQueryApi.estimateGasFee(sourceChain, destinationChain, estimatedGas, options.gasMultipler, options.gasTokenSymbol, undefined, undefined);
            let topupGasAmount = ethers_1.ethers.BigNumber.from(totalGasFee);
            if (options.shouldSubtractBaseFee) {
                const response = yield this.axelarQueryApi
                    .getNativeGasBaseFee(sourceChain, destinationChain)
                    .catch(() => undefined);
                if (response && response.baseFee) {
                    topupGasAmount = topupGasAmount.sub(response.baseFee);
                }
            }
            return topupGasAmount.gt(0) ? topupGasAmount.toString() : "0";
        });
    }
    _getLogIndexAndDestinationChain(chain, txHash, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const evmWalletDetails = (options === null || options === void 0 ? void 0 : options.evmWalletDetails) || { useWindowEthereum: true };
            const signer = this.getSigner(chain, evmWalletDetails);
            const gmpTx = yield this.fetchGMPTransaction(txHash, options === null || options === void 0 ? void 0 : options.logIndex);
            let logIndex = options === null || options === void 0 ? void 0 : options.logIndex;
            let destinationChain = options === null || options === void 0 ? void 0 : options.destChain;
            if (!destinationChain || !logIndex) {
                if (!gmpTx) {
                    const receipt = yield signer.provider.getTransactionReceipt(txHash).catch(() => undefined);
                    if (!receipt)
                        return {};
                    destinationChain = (options === null || options === void 0 ? void 0 : options.destChain) || (0, contractEventHelper_1.getDestinationChainFromTxReceipt)(receipt);
                    logIndex = (_a = options === null || options === void 0 ? void 0 : options.logIndex) !== null && _a !== void 0 ? _a : (0, contractEventHelper_1.getLogIndexFromTxReceipt)(receipt);
                }
                else {
                    logIndex = gmpTx.call.eventIndex;
                    destinationChain = gmpTx.call.returnValues.destinationChain;
                }
            }
            return { logIndex, destinationChain };
        });
    }
    getSigner(chain, evmWalletDetails = { useWindowEthereum: true }) {
        const { rpcMap, networkInfo } = chain_1.default[this.environment];
        const evmClientConfig = {
            rpcUrl: evmWalletDetails.rpcUrl || rpcMap[chain],
            networkOptions: networkInfo[chain],
            evmWalletDetails,
        };
        const evmClient = new EVMClient_1.default(evmClientConfig);
        return evmClient.getSigner();
    }
    getStaticInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.staticInfo) {
                this.staticInfo = yield fetch(s3_1.default[this.environment])
                    .then((res) => res.json())
                    .catch(() => undefined);
            }
            return this.staticInfo;
        });
    }
}
exports.AxelarGMPRecoveryAPI = AxelarGMPRecoveryAPI;
//# sourceMappingURL=AxelarGMPRecoveryAPI.js.map