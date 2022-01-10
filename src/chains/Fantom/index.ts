import {Chain, ChainInfo} from "../../interface";
import Ethereum           from "../Ethereum";

export default class Fantom extends Ethereum implements Chain {

	public chainInfo: ChainInfo = {
		chainSymbol: "FTM",
		chainName: "Fantom",
		estimatedWaitTime: 5,
		fullySupported: true,
		assets: [],
		txFeeInPercent: 0.1,
		module: "evm",
		confirmLevel: 6
	};

	constructor() {
		super();
		this.providerType = "fantom";
	}

}