import {WaitingService}                                              from "./WaitingService";
import {validate as isValidBTCAddress}                               from "bitcoin-address-validation";
import {AssetInfo, BlockchainWaitingServiceFinder, Chain, ChainInfo} from "../../interface";

export default class Bitcoin implements Chain {

	public chainInfo: ChainInfo = {
		assets: [],
		chainSymbol: "BTC",
		chainName: "Bitcoin",
		fullySupported: false,
		estimatedWaitTime: 90,
		txFeeInPercent: 0.1,
		module: "bitcoin"
	}

	constructor() {
	}

	public validateAddress(addressInfo: AssetInfo) {
		return isValidBTCAddress(addressInfo.assetAddress as string);
	}

	public waitingService: BlockchainWaitingServiceFinder = (chainInfo: ChainInfo, assetInfo: AssetInfo) => {
		return new WaitingService(chainInfo, assetInfo);
	}

}