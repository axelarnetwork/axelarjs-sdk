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
exports.parseConfirmDepositCosmosResponse = parseConfirmDepositCosmosResponse;
exports.parseConfirmDepositEvmResponse = parseConfirmDepositEvmResponse;
exports.getConfirmedTx = getConfirmedTx;
exports.confirmDepositRequest = confirmDepositRequest;
exports.createBaseRequest = createBaseRequest;
exports.convertRpcTxToBroadcastTxSuccess = convertRpcTxToBroadcastTxSuccess;
exports.getAmountFromAmountSymbol = getAmountFromAmountSymbol;
exports.getSymbolFromAmountSymbol = getSymbolFromAmountSymbol;
const AxelarRpcClient_1 = __importDefault(require("../client/AxelarRpcClient"));
const interface_1 = require("../interface");
const ethers_1 = require("ethers");
function parseConfirmDepositCosmosResponse(tx) {
    var _a, _b, _c;
    const hash = tx.transactionHash;
    try {
        const log = JSON.parse(tx.rawLog || "");
        const eventKeys = ["chain", "amount", "depositAddress", "transferID"];
        const targetEvent = log[0].events.find((event) => event.type === "depositConfirmation");
        const attributes = targetEvent.attributes;
        const events = {};
        for (const attribute of attributes) {
            if (eventKeys.indexOf(attribute.key) > -1) {
                events[attribute.key] = attribute;
            }
        }
        const commandId = ethers_1.ethers.utils
            .hexZeroPad(ethers_1.ethers.utils.hexlify(parseInt(events["transferID"].value)), 32)
            .slice(2);
        return {
            status: true,
            error: null,
            data: {
                hash,
                chain: "axelar",
                height: tx.height,
                depositTxHash: null,
                amount: getAmountFromAmountSymbol((_a = events["amount"]) === null || _a === void 0 ? void 0 : _a.value),
                depositAddress: (_b = events["depositAddress"]) === null || _b === void 0 ? void 0 : _b.value,
                depositToken: getSymbolFromAmountSymbol((_c = events["amount"]) === null || _c === void 0 ? void 0 : _c.value),
                commandId,
            },
        };
    }
    catch (e) {
        let errorResponse;
        errorResponse = accountMismatchErrorHandler(tx);
        errorResponse = alreadyConfirmedErrorHandler(tx);
        errorResponse = depositNotArrivedYetErrorHandler(tx);
        if (errorResponse)
            return errorResponse;
        throw e;
    }
}
function parseConfirmDepositEvmResponse(tx) {
    var _a, _b, _c, _d, _e;
    const hash = tx.transactionHash;
    try {
        const log = JSON.parse(tx.rawLog || "");
        const eventKeys = ["module", "chain", "txID", "amount", "depositAddress", "tokenAddress"];
        const attributes = log[0].events[0].attributes;
        const events = {};
        for (const attribute of attributes) {
            if (eventKeys.indexOf(attribute.key) > -1) {
                events[attribute.key] = attribute;
            }
        }
        return {
            status: true,
            error: null,
            data: {
                hash,
                chain: (_a = (events["chain"] || events["module"])) === null || _a === void 0 ? void 0 : _a.value,
                height: tx.height,
                amount: (_b = events["amount"]) === null || _b === void 0 ? void 0 : _b.value,
                depositTxHash: (_c = events["txID"]) === null || _c === void 0 ? void 0 : _c.value,
                depositAddress: (_d = events["depositAddress"]) === null || _d === void 0 ? void 0 : _d.value,
                depositToken: (_e = events["tokenAddress"]) === null || _e === void 0 ? void 0 : _e.value,
            },
        };
    }
    catch (e) {
        let errorResponse;
        errorResponse = accountMismatchErrorHandler(tx);
        errorResponse = alreadyConfirmedErrorHandler(tx);
        if (errorResponse)
            return errorResponse;
        throw e;
    }
}
const accountMismatchErrorHandler = (tx) => {
    if (tx && tx.rawLog && tx.rawLog.indexOf("sequence") > -1) {
        return {
            status: false,
            data: null,
            error: tx.rawLog,
            retry: interface_1.RetryErrorRecovery.REFETCH,
        };
    }
    return null;
};
const alreadyConfirmedErrorHandler = (tx) => {
    var _a, _b, _c;
    if (tx &&
        tx.rawLog &&
        (((_a = tx.rawLog) === null || _a === void 0 ? void 0 : _a.indexOf("already burned")) > -1 ||
            ((_b = tx.rawLog) === null || _b === void 0 ? void 0 : _b.indexOf("already confirmed")) > -1 ||
            ((_c = tx.rawLog) === null || _c === void 0 ? void 0 : _c.indexOf("cannot delete existing poll")) > -1)) {
        return {
            status: false,
            data: null,
            error: tx.rawLog,
            retry: interface_1.RetryErrorRecovery.SKIP,
        };
    }
    return null;
};
const depositNotArrivedYetErrorHandler = (tx) => {
    var _a;
    if (tx && tx.rawLog && ((_a = tx.rawLog) === null || _a === void 0 ? void 0 : _a.indexOf("holds no fund")) > -1) {
        return {
            status: false,
            data: null,
            error: tx.rawLog,
            retry: interface_1.RetryErrorRecovery.REBROADCAST,
        };
    }
    return null;
};
function getConfirmedTx(txHash, depositAddress, environment) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = AxelarRpcClient_1.default.getOrCreate(environment);
        const query = confirmDepositRequest(txHash, depositAddress);
        const transactions = yield client.query(query);
        if (!transactions.length) {
            return null;
        }
        const tx = transactions[0];
        const broadcastTx = convertRpcTxToBroadcastTxSuccess(tx);
        return broadcastTx;
    });
}
function confirmDepositRequest(txHash, depositAddress) {
    const baseRequest = createBaseRequest();
    const isEvmTx = txHash.startsWith("0x");
    const query = isEvmTx
        ? `message.action='ConfirmERC20Deposit' AND depositConfirmation.txID='${txHash}'`
        : `message.action='ConfirmDeposit' AND depositConfirmation.depositAddress='${depositAddress}'`;
    return Object.assign(Object.assign({}, baseRequest), { params: Object.assign(Object.assign({}, baseRequest.params), { query }) });
}
function createBaseRequest() {
    return {
        jsonrpc: "2.0",
        id: 1,
        method: "tx_search",
        params: {
            per_page: "10",
            order_by: "desc",
        },
    };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertRpcTxToBroadcastTxSuccess(tx) {
    return {
        height: parseInt(tx.height),
        transactionHash: tx.hash,
        gasUsed: BigInt(tx.tx_result.gas_used),
        gasWanted: BigInt(tx.tx_result.gas_wanted),
        data: tx.tx_result.data,
        rawLog: tx.tx_result.log,
        code: 0,
        events: [],
        msgResponses: [],
        txIndex: 0,
    };
}
function getAmountFromAmountSymbol(amountSymbol) {
    if (amountSymbol.indexOf("ibc") > -1) {
        return amountSymbol.split("ibc")[0];
    }
    else {
        return amountSymbol.replace(/[^0-9]/g, "");
    }
}
function getSymbolFromAmountSymbol(amountSymbol) {
    if (amountSymbol.indexOf("ibc") > -1) {
        return "ibc" + amountSymbol.split("ibc")[1];
    }
    else {
        return amountSymbol.replace(/[^a-z]/g, "");
    }
}
//# sourceMappingURL=axelarHelper.js.map