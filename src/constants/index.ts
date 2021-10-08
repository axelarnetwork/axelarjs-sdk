export interface ISupportedChainType {
	symbol: string;
	name: string;
	assets: IAsset[];
}

export interface IAsset {
	symbol: string;
	name: string;
}

export type ISupportedChainList = ISupportedChainType[];

const bitcoin: ISupportedChainType = {
	symbol: "BTC",
	name: "Bitcoin",
	assets: [
		{ symbol: "BTC", name: "Bitcoin" }
	]
};

const axelar: ISupportedChainType = {
	symbol: "AXL",
	name: "Axelar",
	assets: [
		{ symbol: "AXL", name: "Axelar" }
	]
};

const ethereum: ISupportedChainType = {
	symbol: "ETH",
	name: "Ethereum",
	assets: [
		{ symbol: "ETH", name: "Ether" },
		{ symbol: "axelarBTC", name: "Wrapped Bitcoin" },
		{ symbol: "axelarPHOTON", name: "Wrapped Photon" },
	]
};

export const SupportedChains: ISupportedChainList = [
	axelar,
	bitcoin,
	ethereum
]

