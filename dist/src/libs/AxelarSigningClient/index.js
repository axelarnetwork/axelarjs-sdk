"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxelarSigningClient = void 0;
const constants_1 = require("../../constants");
const stargate_1 = require("@cosmjs/stargate");
const proto_signing_1 = require("@cosmjs/proto-signing");
const MultisigTxTypes_1 = require("./types/MultisigTxTypes");
const AxelarnetTxTypes_1 = require("./types/AxelarnetTxTypes");
const tendermint_rpc_1 = require("@cosmjs/tendermint-rpc");
const tx_1 = require("cosmjs-types/cosmos/tx/v1beta1/tx");
const EvmTxTypes_1 = require("./types/EvmTxTypes");
const NexusTxTypes_1 = require("./types/NexusTxTypes");
const aminomessages_1 = require("./aminomessages");
class AxelarSigningClient extends stargate_1.SigningStargateClient {
    constructor(tendermintClient, signer, signerAddress, options) {
        super(tendermintClient, signer, options);
        this.signerAddress = signerAddress;
    }
    static initOrGetAxelarSigningClient(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { axelarRpcUrl, environment, options, cosmosBasedWalletDetails: walletDetails } = config;
            const links = (0, constants_1.getConfigs)(environment);
            const rpc = axelarRpcUrl || links.axelarRpcUrl;
            const tmClient = yield (0, tendermint_rpc_1.connectComet)(rpc);
            const prefix = "axelar";
            let wallet;
            if (walletDetails.mnemonic)
                wallet = yield proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(walletDetails.mnemonic, { prefix });
            else if (walletDetails.offlineSigner)
                wallet = walletDetails.offlineSigner;
            else
                throw "you need to pass in either a wallet mnemonic string or offline signer";
            const [account] = yield wallet.getAccounts();
            const registry = options.registry || new proto_signing_1.Registry();
            (0, MultisigTxTypes_1.registerMultisigTxTypes)(registry);
            (0, AxelarnetTxTypes_1.registerAxelarnetTxTypes)(registry);
            (0, EvmTxTypes_1.registerEvmTxTypes)(registry);
            (0, NexusTxTypes_1.registerNexusTxTypes)(registry);
            const aminoTypes = options.aminoTypes || new stargate_1.AminoTypes((0, aminomessages_1.createAxelarAminoConverters)());
            const newOpts = Object.assign(Object.assign({}, options), { registry, aminoTypes });
            return new AxelarSigningClient(tmClient, wallet, account.address, newOpts);
        });
    }
    signThenBroadcast(messages, fee, memo) {
        return super.signAndBroadcast(this.signerAddress, messages, fee, memo);
    }
    signAndGetTxBytes(messages, fee, memo, explicitSignerData) {
        const _super = Object.create(null, {
            sign: { get: () => super.sign }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const txRaw = yield _super.sign.call(this, this.signerAddress, messages, fee, memo, explicitSignerData);
            return tx_1.TxRaw.encode(txRaw).finish();
        });
    }
}
exports.AxelarSigningClient = AxelarSigningClient;
__exportStar(require("./const"), exports);
//# sourceMappingURL=index.js.map