export * from "./IAssetTransferObject";
export * from "./IMiscTopics";

export interface IChain {
	chainInfo: IChainInfo;
	validateAddress?: (assetInfo: IAssetInfo) => boolean;
	waitingService?: (chainInfo: IChainInfo, assetInfo: IAssetInfo) => IBlockchainWaitingService;
}

export interface IBlockchainWaitingService {
	wait(...args: any[]): Promise<void>;
}

export interface IChainInfo {
	chainSymbol: string;
	chainName: string;
	assets?: IAssetInfo[];
}

export interface IAssetInfo {
	assetSymbol?: string;
	assetName?: string;
	assetAddress?: string;
}