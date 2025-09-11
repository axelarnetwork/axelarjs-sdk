"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAxelarnetTxTypes = void 0;
const tx_1 = require("@axelar-network/axelarjs-types/axelar/axelarnet/v1beta1/tx");
const TxTypeUrlMap = {
    AxelarnetLinkRequest: `/${tx_1.protobufPackage}.LinkRequest`,
    AxelarnetCallContractRequest: `/${tx_1.protobufPackage}.CallContractRequest`,
    AxelarnetConfirmDepositRequest: `/${tx_1.protobufPackage}.ConfirmDepositRequest`,
    AxelarnetExecutePendingTransfersRequest: `/${tx_1.protobufPackage}.ExecutePendingTransfersRequest`,
    AxelarnetRegisterIBCPathRequest: `/${tx_1.protobufPackage}.RegisterIBCPathRequest`,
    AxelarnetAddCosmosBasedChainRequest: `/${tx_1.protobufPackage}.AddCosmosBasedChainRequest`,
    AxelarnetRegisterAssetRequest: `/${tx_1.protobufPackage}.RegisterAssetRequest`,
    AxelarnetRouteIBCTransfersRequest: `/${tx_1.protobufPackage}.RouteIBCTransfersRequest`,
    AxelarnetRegisterFeeCollectorRequest: `/${tx_1.protobufPackage}.RegisterFeeCollectorRequest`,
    AxelarnetRouteMessageRequest: `/${tx_1.protobufPackage}.RouteMessageRequest`,
};
const registerAxelarnetTxTypes = (registry) => {
    registry.register(TxTypeUrlMap.AxelarnetLinkRequest, tx_1.LinkRequest);
    registry.register(TxTypeUrlMap.AxelarnetCallContractRequest, tx_1.CallContractRequest);
    registry.register(TxTypeUrlMap.AxelarnetConfirmDepositRequest, tx_1.ConfirmDepositRequest);
    registry.register(TxTypeUrlMap.AxelarnetExecutePendingTransfersRequest, tx_1.ExecutePendingTransfersRequest);
    registry.register(TxTypeUrlMap.AxelarnetRegisterIBCPathRequest, tx_1.RegisterIBCPathRequest);
    registry.register(TxTypeUrlMap.AxelarnetAddCosmosBasedChainRequest, tx_1.AddCosmosBasedChainRequest);
    registry.register(TxTypeUrlMap.AxelarnetRegisterAssetRequest, tx_1.RegisterAssetRequest);
    registry.register(TxTypeUrlMap.AxelarnetRouteIBCTransfersRequest, tx_1.RouteIBCTransfersRequest);
    registry.register(TxTypeUrlMap.AxelarnetRegisterFeeCollectorRequest, tx_1.RegisterFeeCollectorRequest);
    registry.register(TxTypeUrlMap.AxelarnetRouteMessageRequest, tx_1.RouteMessageRequest);
};
exports.registerAxelarnetTxTypes = registerAxelarnetTxTypes;
//# sourceMappingURL=AxelarnetTxTypes.js.map