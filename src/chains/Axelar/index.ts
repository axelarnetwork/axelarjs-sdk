import WaitingService                   from "./WaitingService";
import {IAssetInfo, IChain, IChainInfo} from "../../interface";

export default class Axelar implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "AXL",
		chainName: "Axelar",
		estimatedWaitTime: 10,
		fullySupported: true,
		assets: []
	};

	public validateAddress = (addressInfo: IAssetInfo) => true;

	public waitingService = (chainInfo: IChainInfo, assetInfo: IAssetInfo) => new WaitingService(chainInfo, assetInfo)

}