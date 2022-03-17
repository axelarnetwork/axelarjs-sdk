import { ethers, Wallet } from "ethers";

export function createWallet() {
  const wallet = ethers.Wallet.createRandom();
  return wallet;
}

export function signOtc(wallet: Wallet, message: string) {
  return wallet.signMessage(message);
}

const _exports = {
  createWallet,
  signOtc,
};

export default _exports;
