import { AssetInfo } from "../interface";

export interface AssetInfoForChain extends AssetInfo {
  minDepositAmt: number;
}

export interface AssetConfig {
  common_key: string;
  native_chain: string;
  fully_supported: boolean;
  decimals: number;
  chain_aliases: { [key: string]: AssetInfoForChain };
}

const luna_terra: AssetConfig = {
  common_key: "uluna",
  native_chain: "terra",
  fully_supported: true,
  decimals: 6,
  chain_aliases: {
    axelar: {
      assetSymbol: "LUNA",
      assetName: "LUNA (Axelar-wrapped)",
      minDepositAmt: 0.005,
    },
    avalanche: {
      assetSymbol: "LUNA",
      assetName: "LUNA (Axelar-wrapped)",
      minDepositAmt: 0.5,
    },
    ethereum: {
      assetSymbol: "LUNA",
      assetName: "LUNA (Axelar-wrapped)",
      minDepositAmt: 25,
    },
    fantom: {
      assetSymbol: "LUNA",
      assetName: "LUNA (Axelar-wrapped)",
      minDepositAmt: 0.5,
    },
    moonbeam: {
      assetSymbol: "LUNA",
      assetName: "LUNA (Axelar-wrapped)",
      minDepositAmt: 0.5,
    },
    polygon: {
      assetSymbol: "LUNA",
      assetName: "LUNA (Axelar-wrapped)",
      minDepositAmt: 0.5,
    },
    terra: { assetSymbol: "LUNA", assetName: "LUNA", minDepositAmt: 0.005 },
  },
};

const ust_terra: AssetConfig = {
  common_key: "uusd",
  native_chain: "terra",
  fully_supported: true,
  decimals: 6,
  chain_aliases: {
    axelar: {
      assetSymbol: "UST",
      assetName: "UST (Axelar-wrapped)",
      minDepositAmt: 0.5,
    },
    avalanche: {
      assetSymbol: "UST",
      assetName: "UST (Axelar-wrapped)",
      minDepositAmt: 15,
    },
    ethereum: {
      assetSymbol: "UST",
      assetName: "UST (Axelar-wrapped)",
      minDepositAmt: 1000,
    },
    fantom: {
      assetSymbol: "UST",
      assetName: "UST (Axelar-wrapped)",
      minDepositAmt: 15,
    },
    moonbeam: {
      assetSymbol: "UST",
      assetName: "UST (Axelar-wrapped)",
      minDepositAmt: 15,
    },
    osmosis: {
      assetSymbol: "UST",
      assetName: "UST (Axelar-wrapped)",
      minDepositAmt: 0.5,
    },
    polygon: {
      assetSymbol: "UST",
      assetName: "UST (Axelar-wrapped)",
      minDepositAmt: 15,
    },
    terra: { assetSymbol: "UST", assetName: "UST", minDepositAmt: 0.5 },
  },
};

const axl_axelar: AssetConfig = {
  common_key: "uaxl",
  native_chain: "axelar",
  fully_supported: false,
  decimals: 6,
  chain_aliases: {
    axelar: { assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 0.1 },
    avalanche: { assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 10 },
    ethereum: { assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 100 },
    fantom: { assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 10 },
    moonbeam: { assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 10 },
    polygon: { assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 10 },
  },
};

const usdc_fake: AssetConfig = {
  common_key: "uusdc",
  native_chain: "ethereum",
  fully_supported: false,
  decimals: 6,
  chain_aliases: {
    axelar: {
      assetSymbol: "USDC.fake",
      assetName: "USDC.fake",
      minDepositAmt: 10,
    },
    ethereum: {
      assetSymbol: "USDC.fake",
      assetName: "USDC.fake",
      minDepositAmt: 10,
    },
    osmosis: {
      assetSymbol: "USDC.fake",
      assetName: "USDC.fake",
      minDepositAmt: 10,
    },
  },
};

export const allAssets: AssetConfig[] = [axl_axelar, luna_terra, ust_terra, usdc_fake];
