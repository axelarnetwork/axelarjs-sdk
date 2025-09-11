"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMultisigTxTypes = void 0;
const tx_1 = require("@axelar-network/axelarjs-types/axelar/multisig/v1beta1/tx");
const TxTypeUrlMap = {
    MultisigStartKeygenRequest: `/${tx_1.protobufPackage}.StartKeygenRequest`,
    MultisigKeygenOptInRequest: `/${tx_1.protobufPackage}.KeygenOptInRequest`,
    MultisigKeygenOptOutRequest: `/${tx_1.protobufPackage}.KeygenOptOutRequest`,
    MultisigRotateKeyRequest: `/${tx_1.protobufPackage}.RotateKeyRequest`,
    MultisigSubmitPubKeyRequest: `/${tx_1.protobufPackage}.SubmitPubKeyRequest`,
    MultisigSubmitSignatureRequest: `/${tx_1.protobufPackage}.SubmitSignatureRequest`,
};
const registerMultisigTxTypes = (registry) => {
    registry.register(TxTypeUrlMap.MultisigStartKeygenRequest, tx_1.StartKeygenRequest);
    registry.register(TxTypeUrlMap.MultisigKeygenOptInRequest, tx_1.KeygenOptInRequest);
    registry.register(TxTypeUrlMap.MultisigKeygenOptOutRequest, tx_1.KeygenOptOutRequest);
    registry.register(TxTypeUrlMap.MultisigRotateKeyRequest, tx_1.RotateKeyRequest);
    registry.register(TxTypeUrlMap.MultisigSubmitPubKeyRequest, tx_1.SubmitPubKeyRequest);
    registry.register(TxTypeUrlMap.MultisigSubmitSignatureRequest, tx_1.SubmitSignatureRequest);
};
exports.registerMultisigTxTypes = registerMultisigTxTypes;
//# sourceMappingURL=MultisigTxTypes.js.map