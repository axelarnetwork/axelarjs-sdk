const { ethers } = require("ethers");

function createWallet() {
  const wallet = ethers.Wallet.createRandom();
  return wallet;
}

async function signOtc(wallet, message) {
  return wallet.signMessage(message);
}

const _exports = {
  createWallet,
  signOtc,
};

module.exports = _exports;
module.exports.default = _exports;
