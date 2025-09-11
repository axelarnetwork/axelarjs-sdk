"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWallet = createWallet;
exports.signOtc = signOtc;
const ethers_1 = require("ethers");
function createWallet() {
    if (globalThis.sessionStorage) {
        const mnemonic = globalThis.sessionStorage.getItem("axelar-wallet");
        if (mnemonic) {
            const wallet = ethers_1.ethers.Wallet.fromMnemonic(mnemonic);
            return wallet;
        }
        else {
            const wallet = ethers_1.ethers.Wallet.createRandom();
            globalThis.sessionStorage.setItem("axelar-wallet", wallet._mnemonic().phrase);
            return wallet;
        }
    }
    else {
        const wallet = ethers_1.ethers.Wallet.createRandom();
        return wallet;
    }
}
function signOtc(wallet, message) {
    return wallet.signMessage(message);
}
const _exports = {
    createWallet,
    signOtc,
};
exports.default = _exports;
//# sourceMappingURL=wallet.js.map