import {SourceOrDestination} from "./IMiscTopics";

export *                     from "./IAssetTransferObject";
export *                     from "./IMiscTopics";

export interface IChain {
	chainInfo: IChainInfo;
	validateAddress: (assetInfo: IAssetInfo) => boolean;
	waitingService: IBlockchainWaitingServiceFinder;
}

export interface IBlockchainWaitingService {
	wait(...args: any[]): Promise<void>;
}

export interface IChainInfo {
	chainSymbol: string;
	chainName: string;
	noteOnWaitTimes: string;
	assets?: IAssetInfo[];
}

export interface IAssetInfo {
	assetSymbol?: string;
	assetName?: string;
	assetAddress?: string;
}

export type IBlockchainWaitingServiceFinder = (chainInfo: IChainInfo,
                                               assetInfo: IAssetInfo,
                                               sOrDChain: SourceOrDestination
) => IBlockchainWaitingService;