import {WaitingService}                 from "./WaitingService";
import {validate as isValidBTCAddress}  from "bitcoin-address-validation";
import {IAssetInfo, IChain, IChainInfo} from "../../interface";

export default class Bitcoin implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "BTC",
		chainName: "Bitcoin",
		assets: [
			{assetSymbol: "BTC", assetName: "Bitcoin"}
		]
	}

	constructor() {
	}

	public validateAddress(addressInfo: IAssetInfo) {
		return isValidBTCAddress(addressInfo.assetAddress as string);
	}

	public waitingService(chainInfo: IChainInfo, assetInfo: IAssetInfo) {
		return new WaitingService(chainInfo, assetInfo);
	}

}