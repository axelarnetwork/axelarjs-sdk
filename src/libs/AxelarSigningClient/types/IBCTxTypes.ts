import {
  ContractCallWithMintApproved,
  ConfirmGatewayTxStarted,
} from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/events";
import {
  MsgTransfer,
  protobufPackage,
} from "@axelar-network/axelarjs-types/ibc/applications/transfer/v1/tx";
import { Registry } from "@cosmjs/proto-signing";

const TxTypeUrlMap = {
  MsgTransferRequest: `/${protobufPackage}.MsgTransfer`,
};

export const registerIBCTxTypes = (registry: Registry) => {
  registry.register(TxTypeUrlMap.MsgTransferRequest, MsgTransfer);
};
