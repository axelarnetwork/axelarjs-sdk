import WaitingService                   from "./WaitingService";
import {IAssetInfo, IChain, IChainInfo} from "../../interface";

export default class Cosmos implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "COS",
		chainName: "Cosmos",
		assets: [
			{assetSymbol: "uPHOTON", assetName: "Cosmos Hub"},
			{assetSymbol: "LUNA", assetName: "Terra (To be supported)"},
		]
	};

	constructor() {
	}

	public validateAddress = (addressInfo: IAssetInfo) => true;

	public waitingService = (chainInfo: IChainInfo, assetInfo: IAssetInfo) => new WaitingService(chainInfo, assetInfo)

}