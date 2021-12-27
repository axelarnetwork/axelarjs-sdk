import {IAssetInfo} from "../interface";

export interface IAssetInfoForChain extends IAssetInfo {
	minDepositAmt: number;
}

export interface IAssetConfig {
	common_key: string;
	native_chain: string;
	chain_aliases: { [key: string]: IAssetInfoForChain }
}

const luna_terra: IAssetConfig = {
	common_key: "uluna",
	native_chain: "terra",
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

const ust_terra: IAssetConfig = {
	common_key: "uusd",
	native_chain: "terra",
	chain_aliases: {
		axelar: {assetSymbol: "axelarUST", assetName: "Terra USD", minDepositAmt: 0.1 },
		avalanche: {assetSymbol: "axelarUST", assetName: "Terra USD", minDepositAmt: 10 },
		ethereum: {assetSymbol: "axelarUST", assetName: "Terra USD", minDepositAmt: 100 },
		fantom: {assetSymbol: "axelarUST", assetName: "Terra USD", minDepositAmt: 10 },
		moonbeam: {assetSymbol: "axelarUST", assetName: "Terra USD", minDepositAmt: 10 },
		polygon: {assetSymbol: "axelarUST", assetName: "Terra USD", minDepositAmt: 10 },
		terra: {assetSymbol: "UST", assetName: "Terra USD", minDepositAmt: 0.1 },
	}
}

const axl_axelar: IAssetConfig = {
	common_key: "uaxl",
	native_chain: "axelar",
	chain_aliases: {
		axelar: {assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 0.1 },
		avalanche: {assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 10 },
		ethereum: {assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 100 },
		fantom: {assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 10 },
		moonbeam: {assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 10 },
		polygon: {assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 10 }
	}
}

export const allAssets: IAssetConfig[] = [
	axl_axelar,
	ust_terra
];