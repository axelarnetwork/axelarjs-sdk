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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRPCClient = createRPCClient;
exports.broadcastCosmosTx = broadcastCosmosTx;
exports.broadcastCosmosTxBytes = broadcastCosmosTxBytes;
const tendermint_rpc_1 = require("@cosmjs/tendermint-rpc");
const stargate_1 = require("@cosmjs/stargate");
const encoding_1 = require("@cosmjs/encoding");
function createRPCClient(rpcUrl) {
    return new tendermint_rpc_1.HttpClient(rpcUrl);
}
function broadcastCosmosTx(base64Tx, rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const txBytes = (0, encoding_1.fromBase64)(base64Tx);
        const cosmjs = yield stargate_1.StargateClient.connect(rpcUrl);
        return cosmjs.broadcastTx(txBytes).then(convertToAxelarTxResponse);
    });
}
function broadcastCosmosTxBytes(txBytes, rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const cosmjs = yield stargate_1.StargateClient.connect(rpcUrl);
        return cosmjs.broadcastTx(txBytes).then(convertToAxelarTxResponse);
    });
}
function convertToAxelarTxResponse(response) {
    return Object.assign(Object.assign({}, response), { rawLog: response.rawLog || "[]" });
}
//# sourceMappingURL=cosmos.js.map