export interface ISupportedChainType {
	chainSymbol: string;
	chainName: string;
	assets?: IAsset[];
}

export interface IAsset {
	assetSymbol?: string;
	assetName?: string;
	assetAddress?: string;
}

export type ISupportedChainList = ISupportedChainType[];

const bitcoin: ISupportedChainType = {
	chainSymbol: "BTC",
	chainName: "Bitcoin",
	assets: [
		{assetSymbol: "BTC", assetName: "Bitcoin"}
	]
};

const axelar: ISupportedChainType = {
	chainSymbol: "AXL",
	chainName: "Axelar",
	assets: [
		{assetSymbol: "AXL", assetName: "Axelar"}
	]
};

const ethereum: ISupportedChainType = {
	chainSymbol: "ETH",
	chainName: "Ethereum",
	assets: [
		{assetSymbol: "uaxl", assetName: "Axelar"},
		{assetSymbol: "axelarPHOT", assetName: "Photon"},
	]
};

//TODO: find API for these assets to be retrieved programmatically
const cosmos: ISupportedChainType = {
	chainSymbol: "COS",
	chainName: "Cosmos",
	assets: [
		{assetSymbol: "uPHOTON", assetName: "Cosmos Hub"},
		// {assetSymbol: "BNB", assetName: "Binance Coin"},
		{assetSymbol: "LUNA", assetName: "Terra (To be supported)"},
		// {assetSymbol: "OKB", assetName: "OKExChain"},
		// {assetSymbol: "CRO", assetName: "Crypto.com Coin"},
		// {assetSymbol: "UST", assetName: "TerraUST"},
		// {assetSymbol: "RUNE", assetName: "Thorchain"},
		// {assetSymbol: "KCS", assetName: "KuCoin Token"},
		// {assetSymbol: "OSMO", assetName: "Osmosis"},
		// {assetSymbol: "SCRT", assetName: "Secret"},
		// {assetSymbol: "KAVA", assetName: "Kava.io"},
		// {assetSymbol: "FET", assetName: "Fetch.ai"},
		// {assetSymbol: "INJ", assetName: "Injective Protocol"},
		// {assetSymbol: "XPRT", assetName: "Persistence"},
		// {assetSymbol: "MED", assetName: "Medibloc"},
		// {assetSymbol: "ANC", assetName: "Anchor Protocol"},
		// {assetSymbol: "BAND", assetName: "Band Protocol"},
		// {assetSymbol: "AKT", assetName: "Akash Network"},
		// {assetSymbol: "MIR", assetName: "Mirror Protocol"},
		// {assetSymbol: "ROSE", assetName: "Oasis Network"},
		// {assetSymbol: "DAWN", assetName: "Dawn Protocol"},
		// {assetSymbol: "IRIS", assetName: "IRIS Network"},
		// {assetSymbol: "CTK", assetName: "CertiK"},
		// {assetSymbol: "EROWAN", assetName: "Sifchain"},
		// {assetSymbol: "HARD", assetName: "Kava Lend"},
		// {assetSymbol: "BLZ", assetName: "Bluzelle"},
		// {assetSymbol: "ION", assetName: "Ion"},
		// {assetSymbol: "LIKE", assetName: "LikeCoin"},
		// {assetSymbol: "NGM", assetName: "e-Money"},
		// {assetSymbol: "FOAM", assetName: "FOAM"},
		// {assetSymbol: "SWTH", assetName: "Switcheo"},
		// {assetSymbol: "SEFI", assetName: "Secret Finance"},
		// {assetSymbol: "SIENNA", assetName: "Sienna"},
		// {assetSymbol: "KEX", assetName: "Kira Network"},
		// {assetSymbol: "ORAI", assetName: "Oraichain Token"},
		// {assetSymbol: "DVPN", assetName: "Sentinel"},
		// {assetSymbol: "IOV", assetName: "Starname"},
		// {assetSymbol: "BTSG", assetName: "BitSong"},
		// {assetSymbol: "REGEN", assetName: "Regen"},
		// {assetSymbol: "BCNA", assetName: "BitCanna"},
	]
};

export const SupportedChains: ISupportedChainList = [
	axelar,
	// bitcoin,
	cosmos,
	ethereum
]

export const GREPTCHA_SITE_KEY = "6LcxwsocAAAAANQ1t72JEcligfeSr7SSq_pDC9vR"; //this is intentionally public