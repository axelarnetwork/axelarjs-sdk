import {IAssetInfo, IBlockchainWaitingServiceFinder, IChain, IChainInfo, SourceOrDestination} from "../../interface";
import {ChainList}                                                                            from "../../chains";

const waitingServiceMap: { [chainKey: string]: IBlockchainWaitingServiceFinder } = {};

ChainList.forEach((chainInfo: IChain) => {
	const chainKey: string = chainInfo.chainInfo.chainSymbol.toLowerCase();
	waitingServiceMap[chainKey] = chainInfo.waitingService as IBlockchainWaitingServiceFinder
});

const getWaitingService = (type: string, chainInfo: IChainInfo, assetInfo: IAssetInfo, sOrDChain: SourceOrDestination) => {
	return waitingServiceMap[type.toLowerCase()](chainInfo, assetInfo, sOrDChain);
};

export default getWaitingService;