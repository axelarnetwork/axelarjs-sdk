import {IChain, IChainInfo} from "../../interface";
import Axelar               from "../Axelar";

export default class Cosmos extends Axelar implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "COS",
		chainName: "Cosmos",
		estimatedWaitTime: 5,
		fullySupported: false,
		assets: []
	};

	constructor() {
		super();
	}

}