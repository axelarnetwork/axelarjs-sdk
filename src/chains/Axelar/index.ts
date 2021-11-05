import WaitingService                   from "./WaitingService";
import {IAssetInfo, IChain, IChainInfo} from "../../interface";

export default class Axelar implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "AXL",
		chainName: "Axelar",
		noteOnWaitTimes: "Confirmations on Axelar should only take a few minutes",
		assets: [
			{assetSymbol: "uaxl", assetName: "Axelar Token"},
			{assetSymbol: "uphoton", assetName: "Photon"},
			{assetSymbol: "uluna", assetName: "LUNA"},
			{assetSymbol: "ust", assetName: "UST"},
		]
	};

	public validateAddress = (addressInfo: IAssetInfo) => true;

	public waitingService = (chainInfo: IChainInfo, assetInfo: IAssetInfo) => new WaitingService(chainInfo, assetInfo)

}