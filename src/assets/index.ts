import {AssetInfo} from "../interface";

export interface AssetInfoForChain extends AssetInfo {
	minDepositAmt: number;
}

export interface AssetConfig {
	common_key: string;
	native_chain: string;
	fully_supported: boolean;
	decimals: number;
	chain_aliases: { [key: string]: AssetInfoForChain }
}

const luna_terra: AssetConfig = {
	common_key: "uluna",
	native_chain: "terra",
	fully_supported: true,
	decimals: 6,
	chain_aliases: {
		axelar: {assetSymbol: "LUNA", assetName: "LUNA", minDepositAmt: 0.001 },
		avalanche: {assetSymbol: "LUNA", assetName: "LUNA", minDepositAmt: 0.1 },
		ethereum: {assetSymbol: "LUNA", assetName: "LUNA", minDepositAmt: 1 },
		fantom: {assetSymbol: "LUNA", assetName: "LUNA", minDepositAmt: 0.1 },
		moonbeam: {assetSymbol: "LUNA", assetName: "LUNA", minDepositAmt: 0.1 },
		polygon: {assetSymbol: "LUNA", assetName: "LUNA", minDepositAmt: 0.1 },
		terra: {assetSymbol: "LUNA", assetName: "LUNA", minDepositAmt: 0.001 },
	}
}

const ust_terra: AssetConfig = {
	common_key: "uusd",
	native_chain: "terra",
	fully_supported: true,
	decimals: 6,
	chain_aliases: {
		axelar: {assetSymbol: "UST", assetName: "Terra USD", minDepositAmt: 0.1 },
		avalanche: {assetSymbol: "UST", assetName: "Terra USD", minDepositAmt: 10 },
		ethereum: {assetSymbol: "UST", assetName: "Terra USD", minDepositAmt: 100 },
		fantom: {assetSymbol: "UST", assetName: "Terra USD", minDepositAmt: 10 },
		moonbeam: {assetSymbol: "UST", assetName: "Terra USD", minDepositAmt: 10 },
		polygon: {assetSymbol: "UST", assetName: "Terra USD", minDepositAmt: 10 },
		terra: {assetSymbol: "UST", assetName: "Terra USD", minDepositAmt: 0.1 },
	}
}

const axl_axelar: AssetConfig = {
	common_key: "uaxl",
	native_chain: "axelar",
	fully_supported: false,
	decimals: 6,
	chain_aliases: {
		axelar: {assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 0.1 },
		avalanche: {assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 10 },
		ethereum: {assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 100 },
		fantom: {assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 10 },
		moonbeam: {assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 10 },
		polygon: {assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 10 }
	}
}

export const allAssets: AssetConfig[] = [
	axl_axelar,
	luna_terra,
	ust_terra
];