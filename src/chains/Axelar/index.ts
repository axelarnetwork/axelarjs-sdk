import WaitingService                   from "./WaitingService";
import {IAssetInfo, IChain, IChainInfo} from "../../interface";

export default class Axelar implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "AXL",
		chainName: "Axelar",
		estimatedWaitTime: 10,
		fullySupported: true,
		assets: [
			// {assetSymbol: "uaxl", assetName: "Axelar Token"},
			// {assetSymbol: "uphoton", assetName: "Photon"},
			// {assetSymbol: "uluna", assetName: "LUNA"},
			// {assetSymbol: "ust", assetName: "UST"},
		]
	};

	public validateAddress = (addressInfo: IAssetInfo) => true;

	public waitingService = (chainInfo: IChainInfo, assetInfo: IAssetInfo) => new WaitingService(chainInfo, assetInfo)

}