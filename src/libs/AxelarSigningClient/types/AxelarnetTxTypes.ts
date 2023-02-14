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
  ExecuteMessageRequest,
} from "@axelar-network/axelarjs-types/axelar/axelarnet/v1beta1/tx";
import {
  ContractCallSubmitted,
  ContractCallWithTokenSubmitted,
} from "@axelar-network/axelarjs-types/axelar/axelarnet/v1beta1/events";
import { Registry } from "@cosmjs/proto-signing";

const TxTypeUrlMap = {
  AxelarnetLinkRequest: `/${protobufPackage}.LinkRequest`,
  AxelarnetConfirmDepositRequest: `/${protobufPackage}.ConfirmDepositRequest`,
  AxelarnetExecutePendingTransfersRequest: `/${protobufPackage}.ExecutePendingTransfersRequest`,
  AxelarnetRegisterIBCPathRequest: `/${protobufPackage}.RegisterIBCPathRequest`,
  AxelarnetAddCosmosBasedChainRequest: `/${protobufPackage}.AddCosmosBasedChainRequest`,
  AxelarnetRegisterAssetRequest: `/${protobufPackage}.RegisterAssetRequest`,
  AxelarnetRouteIBCTransfersRequest: `/${protobufPackage}.RouteIBCTransfersRequest`,
  AxelarnetRegisterFeeCollectorRequest: `/${protobufPackage}.RegisterFeeCollectorRequest`,
  AxelarnetExecuteMessageRequest: `/${protobufPackage}.ExecuteMessageRequest`,
};

const EventTypeUrlMap = {
  AxelarnetContractCallSubmitted: `/${protobufPackage}.ContractCallSubmitted`,
  AxelarnetContractCallWithTokenSubmitted: `/${protobufPackage}.ContractCallWithTokenSubmitted}`,
};

export const registerAxelarnetTxTypes = (registry: Registry) => {
  registry.register(TxTypeUrlMap.AxelarnetLinkRequest, LinkRequest);
  registry.register(TxTypeUrlMap.AxelarnetConfirmDepositRequest, ConfirmDepositRequest);
  registry.register(
    TxTypeUrlMap.AxelarnetExecutePendingTransfersRequest,
    ExecutePendingTransfersRequest
  );
  registry.register(TxTypeUrlMap.AxelarnetRegisterIBCPathRequest, RegisterIBCPathRequest);
  registry.register(TxTypeUrlMap.AxelarnetAddCosmosBasedChainRequest, AddCosmosBasedChainRequest);
  registry.register(TxTypeUrlMap.AxelarnetRegisterAssetRequest, RegisterAssetRequest);
  registry.register(TxTypeUrlMap.AxelarnetRouteIBCTransfersRequest, RouteIBCTransfersRequest);
  registry.register(TxTypeUrlMap.AxelarnetRegisterFeeCollectorRequest, RegisterFeeCollectorRequest);
  registry.register(TxTypeUrlMap.AxelarnetExecuteMessageRequest, ExecuteMessageRequest);
};

export const registerAxelarnetEventTypes = (registry: Registry) => {
  registry.register(EventTypeUrlMap.AxelarnetContractCallSubmitted, ContractCallSubmitted);
  registry.register(EventTypeUrlMap.AxelarnetContractCallWithTokenSubmitted, ContractCallWithTokenSubmitted);
};
