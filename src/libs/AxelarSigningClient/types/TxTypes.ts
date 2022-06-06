import {
  ConfirmDepositRequest,
  ExecutePendingTransfersRequest,
  RegisterIBCPathRequest,
  AddCosmosBasedChainRequest,
  LinkRequest,
  RegisterAssetRequest,
  RouteIBCTransfersRequest,
  RegisterFeeCollectorRequest,
  protobufPackage,
} from "@axelar-network/axelarjs-types/axelar/axelarnet/v1beta1/tx";
import { Registry } from "@cosmjs/proto-signing";

const TxTypeUrlMap = {
  LinkRequest: `/${protobufPackage}.LinkRequest`,
  ConfirmDepositRequest: `/${protobufPackage}.ConfirmDepositRequest`,
  ExecutePendingTransfersRequest: `/${protobufPackage}.ExecutePendingTransfersRequest`,
  RegisterIBCPathRequest: `/${protobufPackage}.RegisterIBCPathRequest`,
  AddCosmosBasedChainRequest: `/${protobufPackage}.AddCosmosBasedChainRequest`,
  RegisterAssetRequest: `/${protobufPackage}.RegisterAssetRequest`,
  RouteIBCTransfersRequest: `/${protobufPackage}.RouteIBCTransfersRequest`,
  RegisterFeeCollectorRequest: `/${protobufPackage}.RegisterFeeCollectorRequest`,
};

export const registerTxTypes = (registry: Registry) => {
  registry.register(TxTypeUrlMap.LinkRequest, LinkRequest);
  registry.register(TxTypeUrlMap.ConfirmDepositRequest, ConfirmDepositRequest);
  registry.register(TxTypeUrlMap.ExecutePendingTransfersRequest, ExecutePendingTransfersRequest);
  registry.register(TxTypeUrlMap.RegisterIBCPathRequest, RegisterIBCPathRequest);
  registry.register(TxTypeUrlMap.AddCosmosBasedChainRequest, AddCosmosBasedChainRequest);
  registry.register(TxTypeUrlMap.RegisterAssetRequest, RegisterAssetRequest);
  registry.register(TxTypeUrlMap.RouteIBCTransfersRequest, RouteIBCTransfersRequest);
  registry.register(TxTypeUrlMap.RegisterFeeCollectorRequest, RegisterFeeCollectorRequest);
};
