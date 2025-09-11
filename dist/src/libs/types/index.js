"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNativeToken = exports.ApproveGatewayError = exports.QueryTransferStatus = exports.CosmosChain = exports.Environment = void 0;
const constants_1 = require("../../constants");
var Environment;
(function (Environment) {
    Environment["DEVNET"] = "devnet-amplifier";
    Environment["TESTNET"] = "testnet";
    Environment["MAINNET"] = "mainnet";
})(Environment || (exports.Environment = Environment = {}));
var CosmosChain;
(function (CosmosChain) {
    CosmosChain["AXELAR"] = "axelar";
    CosmosChain["COSMOSHUB"] = "cosmoshub";
    CosmosChain["JUNO"] = "juno";
    CosmosChain["OSMOSIS"] = "osmosis";
    CosmosChain["TERRA"] = "terra";
})(CosmosChain || (exports.CosmosChain = CosmosChain = {}));
var QueryTransferStatus;
(function (QueryTransferStatus) {
    QueryTransferStatus["DEPOSIT_CONFIRMED"] = "deposit_confirmed";
    QueryTransferStatus["ASSET_SENT"] = "asset_sent";
    QueryTransferStatus["VOTED"] = "voted";
    QueryTransferStatus["BATCH_SIGNED"] = "batch_signed";
    QueryTransferStatus["IBC_SENT"] = "ibc_sent";
    QueryTransferStatus["EXECUTED"] = "executed";
})(QueryTransferStatus || (exports.QueryTransferStatus = QueryTransferStatus = {}));
var ApproveGatewayError;
(function (ApproveGatewayError) {
    ApproveGatewayError["ALREADY_APPROVED"] = "already approved";
    ApproveGatewayError["ALREADY_EXECUTED"] = "already executed";
    ApproveGatewayError["SIGN_COMMAND_FAILED"] = "cannot sign command";
    ApproveGatewayError["CONFIRM_COMMAND_FAILED"] = "cannot confirm command";
    ApproveGatewayError["FETCHING_STATUS_FAILED"] = "cannot fetching status from axelarscan api";
    ApproveGatewayError["ERROR_BATCHED_COMMAND"] = "cannot find batch command";
    ApproveGatewayError["ERROR_GET_EVM_EVENT"] = "cannot get evm event";
    ApproveGatewayError["ERROR_BROADCAST_EVENT"] = "cannot broadcast event to destination chain";
    ApproveGatewayError["ERROR_UNKNOWN"] = "unknown error";
    ApproveGatewayError["ERROR_ACCOUNT_SEQUENCE_MISMATCH"] = "account sequence mismatch";
})(ApproveGatewayError || (exports.ApproveGatewayError = ApproveGatewayError = {}));
const isNativeToken = (chain, selectedToken, environment) => {
    var _a;
    return ((_a = constants_1.nativeGasTokenSymbol[environment][chain]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === (selectedToken === null || selectedToken === void 0 ? void 0 : selectedToken.toLowerCase());
};
exports.isNativeToken = isNativeToken;
//# sourceMappingURL=index.js.map