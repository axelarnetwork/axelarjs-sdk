process.env.ENVIRONMENT = "testnet";

const { TransferAssetBridge } = require("@axelar-network/axelarjs-sdk");
const { createWallet, signOtc } = require("./lib/ethers");

(async function main() {
  // can be testnet, devnet or mainnet depending of the network yuou want to use
  const axelar = new TransferAssetBridge(process.env.ENVIRONMENT);

  // create random wallet and sign message
  const wallet = createWallet();
  const { otc, validationMsg } = await axelar.getOneTimeCode(wallet.address);
  const signature = await signOtc(wallet, validationMsg);

  const message = {
    otc,
    signature,
    publicAddr: wallet.address,
    sourceChainInfo: {
      chainSymbol: "Terra",
      chainName: "Terra",
      estimatedWaitTime: 5,
      fullySupported: true,
      txFeeInPercent: 0.1,
      module: "axelarnet",
      chainIdentifier: {
        devnet: "terra",
        testnet: "terra",
        mainnet: "terra",
      },
    },
    selectedSourceAsset: {
      assetSymbol: "UST",
      assetName: "UST",
      minDepositAmt: 0.05,
      common_key: "uusd",
      native_chain: "terra",
      decimals: 6,
      fullySupported: true,
    },
    destinationChainInfo: {
      chainSymbol: "AVAX",
      chainName: "Avalanche",
      estimatedWaitTime: 5,
      fullySupported: true,
      txFeeInPercent: 0.1,
      module: "evm",
      confirmLevel: 12,
      chainIdentifier: {
        devnet: "avalanche",
        testnet: "avalanche",
        mainnet: "avalanche",
      },
    },
    selectedDestinationAsset: {
      assetAddress: "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD",
      assetSymbol: "UST",
      common_key: "uusd",
    },
    transactionTraceId: "0aa483e1-0c53-46e5-8c1a-d6a79bb7fce4",
  };

  // const msg2 = {
  //   publicAddr,
  //   signature,
  //   fromChain: chain.Terra,
  //   toChain: chain.Avalance,
  //   assetToTransfer: asset.UST,
  //   destinationAddress: "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD",
  // };

  await axelar
    .getDepositAddress(message)
    .then((data) => console.log(data))
    .catch((error) => console.log(error));
})();
