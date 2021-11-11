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
	assets?: IAssetInfo[];
	chainSymbol: string;
	chainName: string;
	fullySupported: boolean;
	estimatedWaitTime: number;
}

export interface IAssetInfo {
	assetSymbol?: string;
	assetName?: string;
	assetAddress?: string;
	common_key?: string;
	native_chain?: string;
}

export type IBlockchainWaitingServiceFinder = (chainInfo: IChainInfo,
                                               assetInfo: IAssetInfo,
                                               sOrDChain: SourceOrDestination
) => IBlockchainWaitingService;