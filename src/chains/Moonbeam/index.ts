import {Chain, ChainInfo} from "../../interface";
import Ethereum           from "../Ethereum";

export default class Moonbeam extends Ethereum implements Chain {

	public chainInfo: ChainInfo = {
		chainSymbol: "MOONBEAM",
		chainName: "Moonbeam",
		estimatedWaitTime: 5,
		fullySupported: false,
		assets: [],
		txFeeInPercent: 0.1,
		module: "evm",
		confirmLevel: 6
	};

	constructor() {
		super();
		this.providerType = "moonbeam";
	}

}