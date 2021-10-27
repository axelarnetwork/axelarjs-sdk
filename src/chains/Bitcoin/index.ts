import {WaitingService}                 from "./WaitingService";
import {validate as isValidBTCAddress}                                   from "bitcoin-address-validation";
import {IAssetInfo, IBlockchainWaitingServiceFinder, IChain, IChainInfo} from "../../interface";

export default class Bitcoin implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "BTC",
		chainName: "Bitcoin",
		assets: [
			{assetSymbol: "BTC", assetName: "Bitcoin"}
		],
		noteOnWaitTimes: "Confirmations on Bitcoin can take upwards of [90-120] minutes"
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