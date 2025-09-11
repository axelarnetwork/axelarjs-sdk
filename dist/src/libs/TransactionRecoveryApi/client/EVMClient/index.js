"use strict";
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
const ethers_1 = require("ethers");
class EVMClient {
    constructor(config) {
        const { rpcUrl, networkOptions, evmWalletDetails } = config;
        const { privateKey, useWindowEthereum, provider } = evmWalletDetails;
        if (provider) {
            this.provider = provider;
        }
        else {
            this.provider =
                useWindowEthereum && typeof window !== "undefined" && (window === null || window === void 0 ? void 0 : window.ethereum)
                    ? new ethers_1.ethers.providers.Web3Provider(window.ethereum, networkOptions)
                    : provider || new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl, networkOptions);
        }
        this.signer = privateKey
            ? new ethers_1.ethers.Wallet(privateKey).connect(this.provider)
            : this.provider.getSigner();
    }
    getSigner() {
        return this.signer;
    }
    broadcastToGateway(gatewayAddress, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, maxFeePerGas, maxPriorityFeePerGas } = opts;
            const txRequest = Object.assign(Object.assign({}, opts), { to: gatewayAddress, data: `0x${data}`, maxPriorityFeePerGas: maxPriorityFeePerGas || ethers_1.ethers.utils.parseUnits("30", "gwei"), maxFeePerGas: maxFeePerGas || ethers_1.ethers.utils.parseUnits("60", "gwei") });
            yield this.signer.estimateGas(txRequest);
            const tx = yield this.signer.sendTransaction(txRequest);
            yield tx.wait(1);
            return tx;
        });
    }
    buildUnsignedTx(gatewayAddress, opts) {
        const { data, maxFeePerGas, maxPriorityFeePerGas } = opts;
        const txRequest = Object.assign(Object.assign({}, opts), { to: gatewayAddress, data: `0x${data}`, maxPriorityFeePerGas: maxPriorityFeePerGas || ethers_1.ethers.utils.parseUnits("30", "gwei"), maxFeePerGas: maxFeePerGas || ethers_1.ethers.utils.parseUnits("60", "gwei") });
        return txRequest;
    }
    broadcastSignedTx(signedTx) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.provider.sendTransaction(signedTx);
        });
    }
}
exports.default = EVMClient;
//# sourceMappingURL=index.js.map