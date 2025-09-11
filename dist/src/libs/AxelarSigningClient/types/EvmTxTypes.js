"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEvmTxTypes = void 0;
const tx_1 = require("@axelar-network/axelarjs-types/axelar/evm/v1beta1/tx");
const TxTypeUrlMap = {
    EvmLinkRequest: `/${tx_1.protobufPackage}.LinkRequest`,
    EvmSetGatewayRequest: `/${tx_1.protobufPackage}.SetGatewayRequest`,
    EvmConfirmGatewayTxsRequest: `/${tx_1.protobufPackage}.ConfirmGatewayTxsRequest`,
    EvmConfirmGatewayTxRequest: `/${tx_1.protobufPackage}.ConfirmGatewayTxRequest`,
    EvmConfirmDepositRequest: `/${tx_1.protobufPackage}.ConfirmDepositRequest`,
    EvmConfirmTokenRequest: `/${tx_1.protobufPackage}.ConfirmTokenRequest`,
    EvmConfirmTransferKeyRequest: `/${tx_1.protobufPackage}.ConfirmTransferKeyRequest`,
    EvmCreateBurnTokensRequest: `/${tx_1.protobufPackage}.CreateBurnTokensRequest`,
    EvmCreateDeployTokenRequest: `/${tx_1.protobufPackage}.CreateDeployTokenRequest`,
    EvmCreatePendingTransfersRequest: `/${tx_1.protobufPackage}.CreatePendingTransfersRequest`,
    EvmCreateTransferOperatorshipRequest: `/${tx_1.protobufPackage}.CreateTransferOperatorshipRequest`,
    EvmCreateTransferOwnershipRequest: `/${tx_1.protobufPackage}.CreateTransferOwnershipRequest`,
    EvmSignCommandsRequest: `/${tx_1.protobufPackage}.SignCommandsRequest`,
    EvmAddChainRequest: `/${tx_1.protobufPackage}.AddChainRequest`,
    EvmRetryFailedEventRequest: `/${tx_1.protobufPackage}.RetryFailedEventRequest`,
};
const registerEvmTxTypes = (registry) => {
    registry.register(TxTypeUrlMap.EvmLinkRequest, tx_1.LinkRequest);
    registry.register(TxTypeUrlMap.EvmSetGatewayRequest, tx_1.SetGatewayRequest);
    registry.register(TxTypeUrlMap.EvmConfirmGatewayTxsRequest, tx_1.ConfirmGatewayTxsRequest);
    registry.register(TxTypeUrlMap.EvmConfirmGatewayTxRequest, tx_1.ConfirmGatewayTxRequest);
    registry.register(TxTypeUrlMap.EvmConfirmDepositRequest, tx_1.ConfirmDepositRequest);
    registry.register(TxTypeUrlMap.EvmConfirmTokenRequest, tx_1.ConfirmTokenRequest);
    registry.register(TxTypeUrlMap.EvmConfirmTransferKeyRequest, tx_1.ConfirmTransferKeyRequest);
    registry.register(TxTypeUrlMap.EvmCreateBurnTokensRequest, tx_1.CreateBurnTokensRequest);
    registry.register(TxTypeUrlMap.EvmCreateDeployTokenRequest, tx_1.CreateDeployTokenRequest);
    registry.register(TxTypeUrlMap.EvmCreatePendingTransfersRequest, tx_1.CreatePendingTransfersRequest);
    registry.register(TxTypeUrlMap.EvmCreateTransferOperatorshipRequest, tx_1.CreateTransferOperatorshipRequest);
    registry.register(TxTypeUrlMap.EvmCreateTransferOwnershipRequest, tx_1.CreateTransferOwnershipRequest);
    registry.register(TxTypeUrlMap.EvmSignCommandsRequest, tx_1.SignCommandsRequest);
    registry.register(TxTypeUrlMap.EvmAddChainRequest, tx_1.AddChainRequest);
    registry.register(TxTypeUrlMap.EvmRetryFailedEventRequest, tx_1.RetryFailedEventRequest);
};
exports.registerEvmTxTypes = registerEvmTxTypes;
//# sourceMappingURL=EvmTxTypes.js.map