"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNexusTxTypes = void 0;
const tx_1 = require("@axelar-network/axelarjs-types/axelar/nexus/v1beta1/tx");
const TxTypeUrlMap = {
    RegisterChainMaintainerRequest: `/${tx_1.protobufPackage}.RegisterChainMaintainerRequest`,
    DeregisterChainMaintainerRequest: `/${tx_1.protobufPackage}.DeregisterChainMaintainerRequest`,
    ActivateChainRequest: `/${tx_1.protobufPackage}.ActivateChainRequest`,
    DeactivateChainRequest: `/${tx_1.protobufPackage}.DeactivateChainRequest`,
    RegisterAssetFeeRequest: `/${tx_1.protobufPackage}.RegisterAssetFeeRequest`,
    SetTransferRateLimitRequest: `/${tx_1.protobufPackage}.SetTransferRateLimitRequest`,
};
const registerNexusTxTypes = (registry) => {
    registry.register(TxTypeUrlMap.RegisterChainMaintainerRequest, tx_1.RegisterChainMaintainerRequest);
    registry.register(TxTypeUrlMap.DeregisterChainMaintainerRequest, tx_1.DeregisterChainMaintainerRequest);
    registry.register(TxTypeUrlMap.ActivateChainRequest, tx_1.ActivateChainRequest);
    registry.register(TxTypeUrlMap.DeactivateChainRequest, tx_1.DeactivateChainRequest);
    registry.register(TxTypeUrlMap.RegisterAssetFeeRequest, tx_1.RegisterAssetFeeRequest);
    registry.register(TxTypeUrlMap.SetTransferRateLimitRequest, tx_1.SetTransferRateLimitRequest);
};
exports.registerNexusTxTypes = registerNexusTxTypes;
//# sourceMappingURL=NexusTxTypes.js.map