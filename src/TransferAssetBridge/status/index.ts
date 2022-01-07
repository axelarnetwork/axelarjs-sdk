import {
	AssetInfo,
	BlockchainWaitingService,
	BlockchainWaitingServiceFinder,
	Chain,
	ChainInfo,
	SourceOrDestination
}                  from "../../interface";
import {ChainList} from "../../chains";

const waitingServiceMap: { [chainKey: string]: BlockchainWaitingServiceFinder } = {};

ChainList.forEach((chainInfo: Chain) => {
	const chainKey: string = chainInfo.chainInfo.chainSymbol.toLowerCase();
	waitingServiceMap[chainKey] = chainInfo.waitingService as BlockchainWaitingServiceFinder
});

type IGetWaitingService = (chainInfo: ChainInfo,
                           assetInfo: AssetInfo,
                           sOrDChain: SourceOrDestination,
                           environment: string) => BlockchainWaitingService | Promise<BlockchainWaitingService>;
const getWaitingService: IGetWaitingService = (
	chainInfo: ChainInfo,
	assetInfo: AssetInfo,
	sOrDChain: SourceOrDestination,
	environment: string
) => {
	const chainKey = chainInfo.chainSymbol.toLowerCase();
	return waitingServiceMap[chainKey](chainInfo, assetInfo, sOrDChain, environment);
};

export default getWaitingService;