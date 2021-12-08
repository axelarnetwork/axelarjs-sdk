import {IChain, IChainInfo} from "../../interface";
import Ethereum             from "../Ethereum";

export default class Avalanche extends Ethereum implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "AVAX",
		chainName: "Avalanche",
		estimatedWaitTime: 5,
		fullySupported: true,
		assets: [],
		txFeeInPercent: 0.1
	};

	constructor() {
		super();
	}

}