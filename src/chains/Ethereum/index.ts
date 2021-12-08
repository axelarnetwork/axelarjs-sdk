import WaitingService                                                                         from "./WaitingService";
import {isAddress as isValidEVMAddress}                                                       from "ethers/lib/utils";
import {IAssetInfo, IBlockchainWaitingServiceFinder, IChain, IChainInfo, SourceOrDestination} from "../../interface";
import EthersJsWaitingService
                                                                                              from "./EthersJsWaitingService";

export default class Ethereum implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "ETH",
		chainName: "Ethereum",
		estimatedWaitTime: 15,
		fullySupported: true,
		assets: [],
		txFeeInPercent: 0.1
	};

	constructor() {
	}

	public validateAddress = (addressInfo: IAssetInfo) => isValidEVMAddress(addressInfo.assetAddress as string);

	public waitingService: IBlockchainWaitingServiceFinder = async (
		chainInfo: IChainInfo,
		assetInfo: IAssetInfo,
		sOrDChain: SourceOrDestination,
		environment: string
	) => {
		return (sOrDChain === 'source')
			? new WaitingService(chainInfo, assetInfo)
			: await new EthersJsWaitingService(assetInfo).build(chainInfo, assetInfo, environment);
	}
}