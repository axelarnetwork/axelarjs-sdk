import {IAssetInfo} from "../interface";

export interface IAssetConfig {
	common_key: string;
	native_chain: string;
	chain_aliases: { [key: string]: IAssetInfo }
}

const ust_terra: IAssetConfig = {
	common_key: "ust_terra",
	native_chain: "terra",
	chain_aliases: {
		axelar: { assetSymbol: "ust", assetName: "Terra UST"},
		avalanche: { assetSymbol: "ust", assetName: "Terra UST"},
		ethereum: { assetSymbol: "axelarUST", assetName: "Terra UST"},
		terra: { assetSymbol: "ust", assetName: "Terra UST"},
	}
}

const axl_axelar: IAssetConfig = {
	common_key: "axl_axelar",
	native_chain: "axelar",
	chain_aliases: {
		axelar: { assetSymbol: "axl", assetName: "Axelar"},
		ethereum: { assetSymbol: "axl", assetName: "Axelar"},
	}
}

export const allAssets: IAssetConfig[] = [
	axl_axelar,
	ust_terra
];