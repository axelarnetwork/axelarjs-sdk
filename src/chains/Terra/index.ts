import {IChain, IChainInfo} from "../../interface";
import Axelar               from "../Axelar";

export default class Terra extends Axelar implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "Terra",
		chainName: "Terra",
		noteOnWaitTimes: "Confirmations on Terra should only take a few minutes",
		assets: [
			{assetSymbol: "UST", assetName: "UST"},
			{assetSymbol: "LUNA", assetName: "LUNA"}
		]
	};

	constructor() {
		super();
	}

}