import {
  RegisterChainMaintainerRequest,
  DeregisterChainMaintainerRequest,
  ActivateChainRequest,
  DeactivateChainRequest,
  RegisterAssetFeeRequest,
  SetTransferRateLimitRequest,
  protobufPackage,
} from "@axelar-network/axelarjs-types/axelar/nexus/v1beta1/tx";

import { Registry } from "@cosmjs/proto-signing";

const TxTypeUrlMap = {
  RegisterChainMaintainerRequest: `/${protobufPackage}.RegisterChainMaintainerRequest`,
  DeregisterChainMaintainerRequest: `/${protobufPackage}.DeregisterChainMaintainerRequest`,
  ActivateChainRequest: `/${protobufPackage}.ActivateChainRequest`,
  DeactivateChainRequest: `/${protobufPackage}.DeactivateChainRequest`,
  RegisterAssetFeeRequest: `/${protobufPackage}.RegisterAssetFeeRequest`,
  SetTransferRateLimitRequest: `/${protobufPackage}.SetTransferRateLimitRequest`,
};

export const registerNexusTxTypes = (registry: Registry) => {
  registry.register(TxTypeUrlMap.RegisterChainMaintainerRequest, RegisterChainMaintainerRequest);
  registry.register(TxTypeUrlMap.DeregisterChainMaintainerRequest, DeregisterChainMaintainerRequest);
  registry.register(TxTypeUrlMap.ActivateChainRequest, ActivateChainRequest);
  registry.register(TxTypeUrlMap.DeactivateChainRequest, DeactivateChainRequest);
  registry.register(TxTypeUrlMap.RegisterAssetFeeRequest, RegisterAssetFeeRequest);
  registry.register(TxTypeUrlMap.SetTransferRateLimitRequest, SetTransferRateLimitRequest);
};
