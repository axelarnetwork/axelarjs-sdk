import {SourceOrDestination, StatusResponse} from "./IMiscTopics";
import {SocketServices}                      from "../services/SocketServices";
import {IAssetInfoResponse}                  from "./IAssetTransferObject";

export * from "./IAssetTransferObject";
export * from "./IMiscTopics";

export interface IChain {
	chainInfo: IChainInfo;
	validateAddress: (assetInfo: IAssetInfo) => boolean;
	waitingService: IBlockchainWaitingServiceFinder;
}

export interface IAssetAndChainInfo {
	assetInfo: IAssetInfoResponse;
	chainInfo: IChainInfo;
}

export interface IBlockchainWaitingService {
	waitForDepositConfirmation(assetAndChainInfo: IAssetAndChainInfo, interimStatusCb: any, clientSocketConnect: SocketServices): Promise<void>;
	waitForTransferEvent(assetAndChainInfo: IAssetAndChainInfo, interimStatusCb: any, clientSocketConnect: SocketServices): Promise<void>;
	wait(assetAndChainInfo: IAssetAndChainInfo, interimStatusCb: any, clientSocketConnect: SocketServices): Promise<void>;
}

export interface IChainInfo {
	assets?: IAssetInfo[];
	chainSymbol: string;
	chainName: string;
	fullySupported: boolean;
	estimatedWaitTime: number;
	txFeeInPercent: number;
}

export interface IAssetInfo {
	assetSymbol?: string;
	assetName?: string;
	assetAddress?: string;
	common_key?: string;
	native_chain?: string;
	minDepositAmt?: number;
}

export type IBlockchainWaitingServiceFinder = (chainInfo: IChainInfo,
                                               assetInfo: IAssetInfo,
                                               sOrDChain: SourceOrDestination,
                                               environment: string
) => IBlockchainWaitingService | Promise<IBlockchainWaitingService>;