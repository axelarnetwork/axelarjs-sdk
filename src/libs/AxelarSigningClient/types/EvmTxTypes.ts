import {
  SetGatewayRequest,
  ConfirmGatewayTxsRequest,
  ConfirmGatewayTxRequest,
  ConfirmDepositRequest,
  ConfirmTokenRequest,
  ConfirmTransferKeyRequest,
  LinkRequest,
  CreateBurnTokensRequest,
  CreateDeployTokenRequest,
  CreatePendingTransfersRequest,
  CreateTransferOperatorshipRequest,
  CreateTransferOwnershipRequest,
  SignCommandsRequest,
  AddChainRequest,
  RetryFailedEventRequest,
  protobufPackage,
} from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/tx";
import { Registry } from "@cosmjs/proto-signing";

const TxTypeUrlMap = {
  EvmLinkRequest: `/${protobufPackage}.LinkRequest`,
  EvmSetGatewayRequest: `/${protobufPackage}.SetGatewayRequest`,
  EvmConfirmGatewayTxsRequest: `/${protobufPackage}.ConfirmGatewayTxsRequest`,
  EvmConfirmGatewayTxRequest: `/${protobufPackage}.ConfirmGatewayTxRequest`,
  EvmConfirmDepositRequest: `/${protobufPackage}.ConfirmDepositRequest`,
  EvmConfirmTokenRequest: `/${protobufPackage}.ConfirmTokenRequest`,
  EvmConfirmTransferKeyRequest: `/${protobufPackage}.ConfirmTransferKeyRequest`,
  EvmCreateBurnTokensRequest: `/${protobufPackage}.CreateBurnTokensRequest`,
  EvmCreateDeployTokenRequest: `/${protobufPackage}.CreateDeployTokenRequest`,
  EvmCreatePendingTransfersRequest: `/${protobufPackage}.CreatePendingTransfersRequest`,
  EvmCreateTransferOperatorshipRequest: `/${protobufPackage}.CreateTransferOperatorshipRequest`,
  EvmCreateTransferOwnershipRequest: `/${protobufPackage}.CreateTransferOwnershipRequest`,
  EvmSignCommandsRequest: `/${protobufPackage}.SignCommandsRequest`,
  EvmAddChainRequest: `/${protobufPackage}.AddChainRequest`,
  EvmRetryFailedEventRequest: `/${protobufPackage}.RetryFailedEventRequest`,
};

export const registerEvmTxTypes = (registry: Registry) => {
  registry.register(TxTypeUrlMap.EvmLinkRequest, LinkRequest);
  registry.register(TxTypeUrlMap.EvmSetGatewayRequest, SetGatewayRequest);
  registry.register(TxTypeUrlMap.EvmConfirmGatewayTxsRequest, ConfirmGatewayTxsRequest);
  registry.register(TxTypeUrlMap.EvmConfirmGatewayTxRequest, ConfirmGatewayTxRequest);
  registry.register(TxTypeUrlMap.EvmConfirmDepositRequest, ConfirmDepositRequest);
  registry.register(TxTypeUrlMap.EvmConfirmTokenRequest, ConfirmTokenRequest);
  registry.register(TxTypeUrlMap.EvmConfirmTransferKeyRequest, ConfirmTransferKeyRequest);
  registry.register(TxTypeUrlMap.EvmCreateBurnTokensRequest, CreateBurnTokensRequest);
  registry.register(TxTypeUrlMap.EvmCreateDeployTokenRequest, CreateDeployTokenRequest);
  registry.register(TxTypeUrlMap.EvmCreatePendingTransfersRequest, CreatePendingTransfersRequest);
  registry.register(
    TxTypeUrlMap.EvmCreateTransferOperatorshipRequest,
    CreateTransferOperatorshipRequest
  );
  registry.register(TxTypeUrlMap.EvmCreateTransferOwnershipRequest, CreateTransferOwnershipRequest);
  registry.register(TxTypeUrlMap.EvmSignCommandsRequest, SignCommandsRequest);
  registry.register(TxTypeUrlMap.EvmAddChainRequest, AddChainRequest);
  registry.register(TxTypeUrlMap.EvmRetryFailedEventRequest, RetryFailedEventRequest);
};
