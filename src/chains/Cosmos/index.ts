import {IChain, IChainInfo} from "../../interface";
import Axelar               from "../Axelar";

export default class Cosmos extends Axelar implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "COS",
		chainName: "Cosmos",
		noteOnWaitTimes: "Confirmations on Cosmos should only take a few minutes",
		assets: [
			{assetSymbol: "uphoton", assetName: "Cosmos Hub"},
			{assetSymbol: "LUNA", assetName: "Terra (To be supported)"},
		]
	};

	constructor() {
		super();
	}

}