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