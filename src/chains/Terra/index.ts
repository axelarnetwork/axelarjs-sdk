import {IAssetInfo, IChain, IChainInfo} from "../../interface";
import Axelar                           from "../Axelar";
import WaitingService                   from "./WaitingService";


export default class Terra extends Axelar implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "Terra",
		chainName: "Terra",
		estimatedWaitTime: 5,
		fullySupported: true,
		assets: []
	};

	constructor() {
		super();
	}

	public waitingService = (chainInfo: IChainInfo, assetInfo: IAssetInfo) => new WaitingService(chainInfo, assetInfo)

}