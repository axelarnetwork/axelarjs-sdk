import {
    StartKeygenRequest,
    SubmitPubKeyRequest,
    SubmitSignatureRequest,
    RotateKeyRequest,
    KeygenOptInRequest,
    KeygenOptOutRequest,
    protobufPackage,
} from "@axelar-network/axelarjs-types/axelar/multisig/v1beta1/tx";
import { Registry } from "@cosmjs/proto-signing";

const TxTypeUrlMap = {
  MultisigStartKeygenRequest: `/${protobufPackage}.StartKeygenRequest`,
  MultisigKeygenOptInRequest: `/${protobufPackage}.KeygenOptInRequest`,
  MultisigKeygenOptOutRequest: `/${protobufPackage}.KeygenOptOutRequest`,
  MultisigRotateKeyRequest: `/${protobufPackage}.RotateKeyRequest`,
  MultisigSubmitPubKeyRequest: `/${protobufPackage}.SubmitPubKeyRequest`,
  MultisigSubmitSignatureRequest: `/${protobufPackage}.SubmitSignatureRequest`,
};

export const registerMultisigTxTypes = (registry: Registry) => {
    registry.register(TxTypeUrlMap.MultisigStartKeygenRequest, StartKeygenRequest);
    registry.register(TxTypeUrlMap.MultisigKeygenOptInRequest, KeygenOptInRequest);
    registry.register(TxTypeUrlMap.MultisigKeygenOptOutRequest, KeygenOptOutRequest);
    registry.register(TxTypeUrlMap.MultisigRotateKeyRequest, RotateKeyRequest);
    registry.register(TxTypeUrlMap.MultisigSubmitPubKeyRequest, SubmitPubKeyRequest);
    registry.register(TxTypeUrlMap.MultisigSubmitSignatureRequest, SubmitSignatureRequest);
};