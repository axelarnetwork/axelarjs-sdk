import { AssetTransferObject } from "../../../src";

export const getTransferPayload = (
  sig: string,
  publicAddress: string,
  destAddress: string
): AssetTransferObject => {
  return {
    signature: sig,
    publicAddr: publicAddress,
    sourceChainInfo: {
      id: "terra-3",
      chainSymbol: "Terra",
      assets: [],
      chainName: "Terra",
      estimatedWaitTime: 5,
      fullySupported: true,
      txFeeInPercent: 0.1,
      module: "axelarnet",
      chainIdentifier: {
        "devnet-amplifier": "terra",
        testnet: "terra",
        mainnet: "terra",
      },
      nativeAsset: [],
      addressPrefix: "terra",
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
      id: "avalanche",
      chainSymbol: "AVAX",
      assets: [],
      chainName: "Avalanche",
      estimatedWaitTime: 5,
      fullySupported: true,
      txFeeInPercent: 0.1,
      module: "evm",
      confirmLevel: 12,
      chainIdentifier: {
        "devnet-amplifier": "avalanche",
        testnet: "avalanche",
        mainnet: "avalanche",
      },
      nativeAsset: ["wavax-wei"],
      addressPrefix: "",
    },
    selectedDestinationAsset: {
      assetAddress: destAddress,
      assetSymbol: "UST",
      common_key: "uusd",
    },
    transactionTraceId: "0x",
  };
};
