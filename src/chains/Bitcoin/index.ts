import {WaitingService}                                                  from "./WaitingService";
import {validate as isValidBTCAddress}                                   from "bitcoin-address-validation";
import {IAssetInfo, IBlockchainWaitingServiceFinder, IChain, IChainInfo} from "../../interface";

export default class Bitcoin implements IChain {

	public chainInfo: IChainInfo = {
		assets: [],
		chainSymbol: "BTC",
		chainName: "Bitcoin",
		fullySupported: false,
		estimatedWaitTime: 90,
		txFeeInPercent: 0.1
	}

	constructor() {
	}

	public validateAddress(addressInfo: IAssetInfo) {
		return isValidBTCAddress(addressInfo.assetAddress as string);
	}

	public waitingService: IBlockchainWaitingServiceFinder = (chainInfo: IChainInfo, assetInfo: IAssetInfo) => {
		return new WaitingService(chainInfo, assetInfo);
	}

}