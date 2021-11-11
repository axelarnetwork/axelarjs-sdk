import {IChain, IChainInfo} from "../../interface";
import Axelar               from "../Axelar";

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

}