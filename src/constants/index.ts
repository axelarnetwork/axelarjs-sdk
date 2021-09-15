export interface ISupportedChainType {
	symbol: string;
	name: string;
}

export type ISupportedChainList = ISupportedChainType[];

export const SupportedChains: ISupportedChainList = [
	{symbol: "AXE", name: "Axelar"},
	{symbol: "BTC", name: "Bitcoin"},
	{symbol: "ETH", name: "Ethereum"}
]

