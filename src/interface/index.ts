import {SourceOrDestination} from "./Miscellaneous";
import {SocketServices}      from "../services/SocketServices";
import {AssetInfoResponse}   from "./AssetTransferObject";

export * from "./AssetTransferObject";
export * from "./Miscellaneous";

export interface Chain {
	chainInfo: ChainInfo;
	validateAddress: (assetInfo: AssetInfo) => boolean;
	waitingService: BlockchainWaitingServiceFinder;
}

export interface AssetAndChainInfo {
	assetInfo: AssetInfoResponse;
	sourceChainInfo: ChainInfo;
	destinationChainInfo: ChainInfo;
}

export interface BlockchainWaitingService {
	waitForDepositConfirmation(assetAndChainInfo: AssetAndChainInfo, interimStatusCb: any, clientSocketConnect: SocketServices): Promise<void>;
	waitForTransferEvent(assetAndChainInfo: AssetAndChainInfo, interimStatusCb: any, clientSocketConnect: SocketServices): Promise<void>;
	wait(assetAndChainInfo: AssetAndChainInfo, interimStatusCb: any, clientSocketConnect: SocketServices): Promise<void>;
}

export interface ChainInfo {
	assets?: AssetInfo[];
	chainSymbol: string;
	chainName: string;
	fullySupported: boolean;
	estimatedWaitTime: number;
	txFeeInPercent: number;
	module: "axelarnet" | "evm" | "bitcoin";
	confirmLevel?: number;
}

export interface AssetInfo {
	assetSymbol?: string;
	assetName?: string;
	assetAddress?: string;
	common_key?: string;
	fullySupported?: boolean;
	native_chain?: string;
	minDepositAmt?: number;
	decimals?: number;
}

export type BlockchainWaitingServiceFinder = (chainInfo: ChainInfo,
                                              assetInfo: AssetInfo,
                                              sOrDChain: SourceOrDestination,
                                              environment: string
) => BlockchainWaitingService | Promise<BlockchainWaitingService>;