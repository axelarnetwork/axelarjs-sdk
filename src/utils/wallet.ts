import { ethers, Wallet } from "ethers";

export function createWallet() {
  if (globalThis.sessionStorage) {
    const mnemonic = globalThis.sessionStorage.getItem("axelar-wallet");
    if (mnemonic) {
      const wallet = ethers.Wallet.fromMnemonic(mnemonic);
      return wallet;
    } else {
      const wallet = ethers.Wallet.createRandom();
      globalThis.sessionStorage.setItem("axelar-wallet", wallet._mnemonic().phrase);
      return wallet;
    }
  } else {
    const wallet = ethers.Wallet.createRandom();
    return wallet;
  }
}

export function signOtc(wallet: Wallet, message: string) {
  return wallet.signMessage(message);
}

const _exports = {
  createWallet,
  signOtc,
};

export default _exports;
