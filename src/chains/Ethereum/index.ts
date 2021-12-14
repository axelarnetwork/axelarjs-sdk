import WaitingService                                                                         from "./WaitingService";
import {isAddress as isValidEVMAddress}                                                       from "ethers/lib/utils";
import {IAssetInfo, IBlockchainWaitingServiceFinder, IChain, IChainInfo, SourceOrDestination} from "../../interface";
import EthersJsWaitingService
                                                                                              from "../../utils/EthersJs/EthersJsWaitingService";
import {ProviderType}                                                                         from "../../utils/EthersJs/ethersjsProvider";

export default class Ethereum implements IChain {

	public providerType: ProviderType;

	public chainInfo: IChainInfo = {
		chainSymbol: "ETH",
		chainName: "Ethereum",
		estimatedWaitTime: 15,
		fullySupported: true,
		assets: [],
		txFeeInPercent: 0.1
	};

	constructor() {
		this.providerType = "infuraWS";
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
			: await new EthersJsWaitingService(chainInfo, assetInfo).build(chainInfo, assetInfo, environment, this.providerType);
	}
}