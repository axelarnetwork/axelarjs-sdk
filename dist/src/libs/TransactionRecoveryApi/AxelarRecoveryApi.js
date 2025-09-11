"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxelarRecoveryApi = exports.GasPaidStatus = exports.GMPStatus = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const ethers_1 = require("ethers");
const chains_1 = require("../../chains");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const AxelarQueryClient_1 = require("../AxelarQueryClient");
const EVMClient_1 = __importDefault(require("./client/EVMClient"));
const cosmos_1 = require("./client/helpers/cosmos");
const chain_1 = __importDefault(require("./constants/chain"));
const mappers_1 = require("./helpers/mappers");
var GMPStatus;
(function (GMPStatus) {
    GMPStatus["SRC_GATEWAY_CALLED"] = "source_gateway_called";
    GMPStatus["DEST_GATEWAY_APPROVED"] = "destination_gateway_approved";
    GMPStatus["DEST_EXECUTED"] = "destination_executed";
    GMPStatus["EXPRESS_EXECUTED"] = "express_executed";
    GMPStatus["DEST_EXECUTE_ERROR"] = "error";
    GMPStatus["DEST_EXECUTING"] = "executing";
    GMPStatus["APPROVING"] = "approving";
    GMPStatus["FORECALLED"] = "forecalled";
    GMPStatus["FORECALLED_WITHOUT_GAS_PAID"] = "forecalled_without_gas_paid";
    GMPStatus["NOT_EXECUTED"] = "not_executed";
    GMPStatus["NOT_EXECUTED_WITHOUT_GAS_PAID"] = "not_executed_without_gas_paid";
    GMPStatus["INSUFFICIENT_FEE"] = "insufficient_fee";
    GMPStatus["UNKNOWN_ERROR"] = "unknown_error";
    GMPStatus["CANNOT_FETCH_STATUS"] = "cannot_fetch_status";
    GMPStatus["SRC_GATEWAY_CONFIRMED"] = "confirmed";
})(GMPStatus || (exports.GMPStatus = GMPStatus = {}));
var GasPaidStatus;
(function (GasPaidStatus) {
    GasPaidStatus["GAS_UNPAID"] = "gas_unpaid";
    GasPaidStatus["GAS_PAID"] = "gas_paid";
    GasPaidStatus["GAS_PAID_NOT_ENOUGH_GAS"] = "gas_paid_not_enough_gas";
    GasPaidStatus["GAS_PAID_ENOUGH_GAS"] = "gas_paid_enough_gas";
})(GasPaidStatus || (exports.GasPaidStatus = GasPaidStatus = {}));
const DEFAULT_SUBSCRIPTION_STRATEGY = {
    kind: "polling",
    interval: 15000,
};
class AxelarRecoveryApi {
    constructor(config) {
        this.axelarQuerySvc = null;
        this.chainsList = [];
        const { environment } = config;
        const links = (0, constants_1.getConfigs)(environment);
        this.axelarGMPApiUrl = links.axelarGMPApiUrl;
        this.debugMode = !!config.debug;
        this.axelarscanBaseApiUrl = links.axelarscanBaseApiUrl;
        this.recoveryApiUrl = links.recoveryApiUrl;
        this.wssStatusUrl = links.wssStatus;
        this.axelarRpcUrl = config.axelarRpcUrl || links.axelarRpcUrl;
        this.axelarLcdUrl = config.axelarLcdUrl || links.axelarLcdUrl;
        this.environment = environment;
        this.config = config;
    }
    fetchGMPTransaction(txHash, txLogIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.execGet(this.axelarGMPApiUrl, {
                method: "searchGMP",
                txHash,
                txLogIndex,
            })
                .then((data) => data.find((gmpTx) => gmpTx.id.toLowerCase().indexOf(txHash.toLowerCase()) > -1 ||
                gmpTx.call.transactionHash.toLowerCase().indexOf(txHash.toLowerCase()) > -1 // the source transaction hash will be stored at "tx.call.transactionHash", if it is sent from cosmos, otherwise it'll be stored at `tx.id` field.
            ))
                .catch(() => undefined);
        });
    }
    fetchBatchData(chainId, commandId) {
        return __awaiter(this, void 0, void 0, function* () {
            /**first check axelarscan API */
            const batchData = yield this.execPost(this.axelarscanBaseApiUrl, "/batches", {
                commandId,
            })
                .then((res) => res[0])
                .catch(() => undefined);
            /**if not found, check last few batches on core in case it is an issue of delayed indexing of data on the axelarscan API */
            if (!batchData) {
                return this.searchRecentBatchesFromCore(chainId, commandId);
            }
            return batchData;
        });
    }
    searchRecentBatchesFromCore(chainId, commandId, batchId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, utils_1.retry)(() => __awaiter(this, void 0, void 0, function* () {
                const batchData = yield this.queryBatchedCommands(chainId, batchId).catch(() => undefined);
                if (!batchData)
                    return;
                if (!batchData.commandIds.includes(commandId))
                    return Promise.reject("command id not found in batch");
                return (0, mappers_1.mapIntoAxelarscanResponseType)(batchData, chainId);
            }));
        });
    }
    parseGMPStatus(response) {
        const { error, status } = response;
        if (status === "error" && error)
            return GMPStatus.DEST_EXECUTE_ERROR;
        else if (status === "executed")
            return GMPStatus.DEST_EXECUTED;
        else if (status === "approved")
            return GMPStatus.DEST_GATEWAY_APPROVED;
        else if (status === "called")
            return GMPStatus.SRC_GATEWAY_CALLED;
        else if (status === "executing")
            return GMPStatus.DEST_EXECUTING;
        else {
            return status;
        }
    }
    parseGMPError(response) {
        if (response.error) {
            return {
                message: response.error.error.message,
                txHash: response.error.error.transactionHash,
                chain: response.error.chain,
            };
        }
        else if (response.is_insufficient_fee) {
            return {
                message: "Insufficient fee",
                txHash: response.call.transaction.hash,
                chain: response.call.chain,
            };
        }
    }
    queryTransactionStatus(txHash, txLogIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const txDetails = yield this.fetchGMPTransaction(txHash, txLogIndex);
            if (!txDetails)
                return { status: GMPStatus.CANNOT_FETCH_STATUS };
            const { call, gas_status, gas_paid, executed, express_executed, approved, callback } = txDetails;
            const gasPaidInfo = {
                status: gas_status,
                details: gas_paid,
            };
            // Note: Currently, the GMP API doesn't always return the `total` field in the `time_spent` object
            // This is a temporary fix to ensure that the `total` field is always present
            // TODO: Remove this once the API is fixed
            const timeSpent = txDetails.time_spent;
            if (timeSpent) {
                timeSpent.total =
                    timeSpent.total ||
                        Object.values(timeSpent).reduce((accumulator, value) => accumulator + value, 0);
            }
            return {
                status: this.parseGMPStatus(txDetails),
                error: this.parseGMPError(txDetails),
                timeSpent,
                gasPaidInfo,
                callTx: call,
                executed,
                expressExecuted: express_executed,
                approved,
                callback,
            };
        });
    }
    /**
     * Subscribe to a transaction status using either a websocket or polling strategy
     */
    subscribeToTx(txHash_1, cb_1) {
        return __awaiter(this, arguments, void 0, function* (txHash, cb, strategy = DEFAULT_SUBSCRIPTION_STRATEGY) {
            if (strategy.kind === "websocket") {
                this.subscribeToTxWSS_EXPERIMENTAL(txHash, cb);
            }
            else {
                this.subscribeToTxPOLLING(txHash, cb, strategy.interval);
            }
        });
    }
    /**
     * Subscribe to a transaction status using a polling strategy
     */
    subscribeToTxPOLLING(txHash_1, cb_1) {
        return __awaiter(this, arguments, void 0, function* (txHash, cb, interval = 30000 // 30 seconds
        ) {
            const intervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield this.queryTransactionStatus(txHash);
                cb(response);
                if (response.status === GMPStatus.DEST_EXECUTED) {
                    clearInterval(intervalId);
                }
            }), interval);
        });
    }
    /**
     * Subscribe to a transaction status using a websocket strategy (Experimental)
     */
    subscribeToTxWSS_EXPERIMENTAL(txHash, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = new WebSocket(this.wssStatusUrl);
            conn.onopen = () => {
                const msg = JSON.stringify({
                    action: "sendmessage",
                    topic: "subscribeToSrcChainTx",
                    srcTxHash: txHash,
                });
                conn.send(msg);
            };
            conn.onmessage = (event) => {
                const resData = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
                if (resData === null || resData === void 0 ? void 0 : resData.txStatus) {
                    resData.txStatus = this.parseGMPStatus({ status: resData.txStatus, error: "" });
                }
                if ((resData === null || resData === void 0 ? void 0 : resData.txStatus) === GMPStatus.DEST_EXECUTED)
                    conn.close();
                cb === null || cb === void 0 ? void 0 : cb(resData);
            };
        });
    }
    queryExecuteParams(txHash, txLogIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.fetchGMPTransaction(txHash, txLogIndex);
            if (!data)
                return;
            // Return if approve tx doesn't not exist
            const approvalTx = data.approved;
            if (!(approvalTx === null || approvalTx === void 0 ? void 0 : approvalTx.transactionHash)) {
                return {
                    status: GMPStatus.SRC_GATEWAY_CALLED,
                };
            }
            // Return if it's already executed
            const executeTx = data.executed;
            if (executeTx === null || executeTx === void 0 ? void 0 : executeTx.transactionHash) {
                return {
                    status: GMPStatus.DEST_EXECUTED,
                };
            }
            const callTx = data.call;
            return {
                status: GMPStatus.DEST_GATEWAY_APPROVED,
                data: {
                    commandId: approvalTx.returnValues.commandId,
                    destinationChain: approvalTx.chain.toLowerCase(),
                    destinationContractAddress: callTx.returnValues.destinationContractAddress,
                    isContractCallWithToken: callTx.event === "ContractCallWithToken",
                    payload: callTx.returnValues.payload,
                    srcTxInfo: {
                        transactionHash: callTx.transactionHash,
                        transactionIndex: callTx.transactionIndex,
                        logIndex: callTx.logIndex,
                    },
                    sourceAddress: approvalTx.returnValues.sourceAddress,
                    sourceChain: approvalTx.returnValues.sourceChain,
                    symbol: approvalTx.returnValues.symbol,
                    amount: approvalTx.returnValues.amount &&
                        ethers_1.BigNumber.from(approvalTx.returnValues.amount).toString(),
                },
            };
        });
    }
    getChainInfo(chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.chainsList.length === 0) {
                this.chainsList = yield (0, chains_1.loadChains)({
                    environment: this.environment,
                });
            }
            const chainInfo = this.chainsList.find((chainInfo) => chainInfo.id.toLowerCase() === chainId.toLowerCase());
            if (!chainInfo) {
                throw new Error(`cannot find chain ${chainId}`);
            }
            return chainInfo;
        });
    }
    confirmGatewayTx(txHash, chainName) {
        return __awaiter(this, void 0, void 0, function* () {
            const { module, chainIdentifier } = yield this.getChainInfo(chainName);
            const txBytes = yield this.execRecoveryUrlFetch("/confirm_gateway_tx", {
                txHash,
                module,
                chain: chainIdentifier[this.environment],
            });
            return (0, cosmos_1.broadcastCosmosTxBytes)(txBytes, this.axelarRpcUrl);
        });
    }
    createPendingTransfers(chainName) {
        return __awaiter(this, void 0, void 0, function* () {
            const { module, chainIdentifier } = yield this.getChainInfo(chainName);
            const txBytes = yield this.execRecoveryUrlFetch("/create_pending_transfers", {
                chain: chainIdentifier[this.environment],
                module,
            });
            return (0, cosmos_1.broadcastCosmosTxBytes)(txBytes, this.axelarRpcUrl);
        });
    }
    executePendingTransfers(chainName) {
        return __awaiter(this, void 0, void 0, function* () {
            const { module, chainIdentifier } = yield this.getChainInfo(chainName);
            const txBytes = yield this.execRecoveryUrlFetch("/execute_pending_transfers", {
                chain: chainIdentifier[this.environment],
                module,
            });
            return (0, cosmos_1.broadcastCosmosTxBytes)(txBytes, this.axelarRpcUrl);
        });
    }
    routeMessageRequest(txHash, payload, logIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const txBytes = yield this.execRecoveryUrlFetch("/route_message", {
                payload,
                id: logIndex === -1 ? `${txHash}` : `${txHash}-${logIndex}`,
            });
            return (0, cosmos_1.broadcastCosmosTxBytes)(txBytes, this.axelarRpcUrl);
        });
    }
    signCommands(chainName) {
        return __awaiter(this, void 0, void 0, function* () {
            const { module, chainIdentifier } = yield this.getChainInfo(chainName);
            const txBytes = yield this.execRecoveryUrlFetch("/sign_commands", {
                chain: chainIdentifier[this.environment],
                module,
            });
            return (0, cosmos_1.broadcastCosmosTxBytes)(txBytes, this.axelarRpcUrl);
        });
    }
    queryBatchedCommands(chainId_1) {
        return __awaiter(this, arguments, void 0, function* (chainId, batchCommandId = "") {
            if (!this.axelarQuerySvc)
                this.axelarQuerySvc = yield AxelarQueryClient_1.AxelarQueryClient.initOrGetAxelarQueryClient(this.config);
            yield (0, utils_1.throwIfInvalidChainIds)([chainId], this.environment);
            return this.axelarQuerySvc.evm.BatchedCommands({ chain: chainId, id: batchCommandId });
        });
    }
    queryGatewayAddress(_a) {
        return __awaiter(this, arguments, void 0, function* ({ chain }) {
            if (!this.axelarQuerySvc)
                this.axelarQuerySvc = yield AxelarQueryClient_1.AxelarQueryClient.initOrGetAxelarQueryClient(this.config);
            yield (0, utils_1.throwIfInvalidChainIds)([chain], this.environment);
            return this.axelarQuerySvc.evm.GatewayAddress({ chain });
        });
    }
    getSignedTxAndBroadcast(chain, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_1.throwIfInvalidChainIds)([chain], this.environment);
            const gatewayInfo = yield this.queryGatewayAddress({ chain });
            const evmClient = new EVMClient_1.default({
                rpcUrl: chain_1.default[this.environment].rpcMap[chain],
                evmWalletDetails: { useWindowEthereum: true },
            });
            const txRequest = evmClient.buildUnsignedTx(gatewayInfo.address, { data });
            const signedTx = yield this.execRecoveryUrlFetch("/sign_evm_tx", {
                chain,
                gatewayAddress: gatewayInfo.address,
                txRequest,
            });
            const tx = yield evmClient.broadcastSignedTx(signedTx);
            tx.wait(1);
            return tx;
        });
    }
    sendApproveTx(chain, data, evmWalletDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_1.throwIfInvalidChainIds)([chain], this.environment);
            const gatewayInfo = yield this.queryGatewayAddress({ chain });
            const evmClient = new EVMClient_1.default({
                rpcUrl: chain_1.default[this.environment].rpcMap[chain],
                evmWalletDetails,
            });
            const txRequest = evmClient.buildUnsignedTx(gatewayInfo.address, { data });
            return this.execRecoveryUrlFetch("/send_evm_tx", {
                chain,
                gatewayAddress: gatewayInfo.address,
                txRequest,
            });
        });
    }
    broadcastEvmTx(chain_2, data_1) {
        return __awaiter(this, arguments, void 0, function* (chain, data, evmWalletDetails = { useWindowEthereum: true }) {
            yield (0, utils_1.throwIfInvalidChainIds)([chain], this.environment);
            const gatewayInfo = yield this.queryGatewayAddress({ chain });
            const evmClient = new EVMClient_1.default({
                rpcUrl: chain_1.default[this.environment].rpcMap[chain],
                evmWalletDetails,
            });
            return evmClient.broadcastToGateway(gatewayInfo.address, { data });
        });
    }
    execRecoveryUrlFetch(endpoint, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.execPost(this.recoveryApiUrl, endpoint, params);
        });
    }
    execPost(base, endpoint, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, cross_fetch_1.default)(base + endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            })
                .then((res) => res.json())
                .then((res) => res.data);
        });
    }
    execGet(base, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, cross_fetch_1.default)(`${base}?${new URLSearchParams(params).toString()}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
            })
                .then((res) => res.json())
                .then((res) => res.data);
        });
    }
    get getAxelarGMPApiUrl() {
        return this.axelarGMPApiUrl;
    }
}
exports.AxelarRecoveryApi = AxelarRecoveryApi;
//# sourceMappingURL=AxelarRecoveryApi.js.map