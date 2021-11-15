import {
	IAssetInfo,
	IBlockchainWaitingService,
	IBlockchainWaitingServiceFinder,
	IChain,
	IChainInfo,
	SourceOrDestination
} from "../../interface";
import {ChainList}                                                                            from "../../chains";

const waitingServiceMap: { [chainKey: string]: IBlockchainWaitingServiceFinder } = {};

ChainList.forEach((chainInfo: IChain) => {
	const chainKey: string = chainInfo.chainInfo.chainSymbol.toLowerCase();
	waitingServiceMap[chainKey] = chainInfo.waitingService as IBlockchainWaitingServiceFinder
});

type IGetWaitingService = (	chainKey: string,
	chainInfo: IChainInfo,
	assetInfo: IAssetInfo,
	sOrDChain: SourceOrDestination,
	environment: string) => IBlockchainWaitingService;
const getWaitingService: IGetWaitingService = (
	chainKey: string,
	chainInfo: IChainInfo,
	assetInfo: IAssetInfo,
	sOrDChain: SourceOrDestination,
	environment: string
) => {
	return waitingServiceMap[chainKey.toLowerCase()](chainInfo, assetInfo, sOrDChain, environment);
};

export default getWaitingService;