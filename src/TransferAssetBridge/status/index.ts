import {
	IAssetInfo,
	IBlockchainWaitingService,
	IBlockchainWaitingServiceFinder,
	IChain,
	IChainInfo,
	SourceOrDestination
}                  from "../../interface";
import {ChainList} from "../../chains";

const waitingServiceMap: { [chainKey: string]: IBlockchainWaitingServiceFinder } = {};

ChainList.forEach((chainInfo: IChain) => {
	const chainKey: string = chainInfo.chainInfo.chainSymbol.toLowerCase();
	waitingServiceMap[chainKey] = chainInfo.waitingService as IBlockchainWaitingServiceFinder
});

type IGetWaitingService = (chainInfo: IChainInfo,
                           assetInfo: IAssetInfo,
                           sOrDChain: SourceOrDestination,
                           environment: string) => IBlockchainWaitingService | Promise<IBlockchainWaitingService>;
const getWaitingService: IGetWaitingService = (
	chainInfo: IChainInfo,
	assetInfo: IAssetInfo,
	sOrDChain: SourceOrDestination,
	environment: string
) => {
	const chainKey = chainInfo.chainSymbol.toLowerCase();
	return waitingServiceMap[chainKey](chainInfo, assetInfo, sOrDChain, environment);
};

export default getWaitingService;