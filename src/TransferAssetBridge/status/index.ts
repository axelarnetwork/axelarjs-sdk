import {IAssetInfo, IBlockchainWaitingService, IChain, IChainInfo} from "../../interface";
import {ChainList}                                                 from "../../chains";

const waitingServiceMap: { [chainKey: string]: (chainInfo: IChainInfo, assetInfo: IAssetInfo) => IBlockchainWaitingService } = {};

ChainList.forEach((chainInfo: IChain) => {
	const chainKey: string = chainInfo.chainInfo.chainSymbol.toLowerCase();
	waitingServiceMap[chainKey] = chainInfo.waitingService as (
		chainInfo: IChainInfo, assetInfo: IAssetInfo) => IBlockchainWaitingService
});

const getWaitingService = (type: string, chainInfo: IChainInfo, tokenInfo: IAssetInfo) => {
	return waitingServiceMap[type.toLowerCase()](chainInfo, tokenInfo);
};

export default getWaitingService;