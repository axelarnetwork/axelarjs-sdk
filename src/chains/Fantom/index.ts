import {IChain, IChainInfo} from "../../interface";
import Ethereum             from "../Ethereum";

export default class Fantom extends Ethereum implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "FTM",
		chainName: "Fantom",
		estimatedWaitTime: 5,
		fullySupported: true,
		assets: [],
		txFeeInPercent: 0.1
	};

	constructor() {
		super();
	}

}