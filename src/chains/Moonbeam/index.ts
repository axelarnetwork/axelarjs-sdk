import {IAssetInfo, IBlockchainWaitingServiceFinder, IChain, IChainInfo, SourceOrDestination} from "../../interface";
import Ethereum                                                                               from "../Ethereum";
import WaitingService
                                                                                              from "../Ethereum/WaitingService";
import EthersJsWaitingService
                                                                                              from "../../utils/EthersJs/EthersJsWaitingService";

export default class Moonbeam extends Ethereum implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "MOONBEAM",
		chainName: "Moonbeam",
		estimatedWaitTime: 5,
		fullySupported: true,
		assets: [],
		txFeeInPercent: 0.1
	};

	constructor() {
		super();
	}

	public waitingService: IBlockchainWaitingServiceFinder = async (
		chainInfo: IChainInfo,
		assetInfo: IAssetInfo,
		sOrDChain: SourceOrDestination,
		environment: string
	) => {
		return (sOrDChain === 'source')
			? new WaitingService(chainInfo, assetInfo)
			: await new EthersJsWaitingService(chainInfo, assetInfo).build(chainInfo, assetInfo, environment, "moonbeam");
	}

}