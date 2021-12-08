import {IAssetInfo} from "../interface";

export interface IAssetConfig {
	common_key: string;
	native_chain: string;
	chain_aliases: { [key: string]: IAssetInfo }
}

const ust_terra: IAssetConfig = {
	common_key: "uusd",
	native_chain: "terra",
	chain_aliases: {
		axelar: {assetSymbol: "axelarUST", assetName: "Terra USD"},
		avalanche: {assetSymbol: "axelarUST", assetName: "Terra USD"},
		ethereum: {assetSymbol: "axelarUST", assetName: "Terra USD"},
		fantom: {assetSymbol: "axelarUST", assetName: "Terra USD"},
		moonbeam: {assetSymbol: "axelarUST", assetName: "Terra USD"},
		polygon: {assetSymbol: "axelarUST", assetName: "Terra USD"},
		terra: {assetSymbol: "UST", assetName: "Terra USD"},
	}
}

const axl_axelar: IAssetConfig = {
	common_key: "uaxl",
	native_chain: "axelar",
	chain_aliases: {
		axelar: {assetSymbol: "AXL", assetName: "Axelar"},
		ethereum: {assetSymbol: "AXL", assetName: "Axelar"},
		fantom: {assetSymbol: "AXL", assetName: "Axelar"},
		moonbeam: {assetSymbol: "AXL", assetName: "Axelar"},
		polygon: {assetSymbol: "AXL", assetName: "Axelar"}
	}
}

export const allAssets: IAssetConfig[] = [
	axl_axelar,
	ust_terra
];