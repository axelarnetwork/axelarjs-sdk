import {IChain, IChainInfo} from "../../interface";
import Ethereum             from "../Ethereum";

export default class Moonbeam extends Ethereum implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "MOONBEAM",
		chainName: "Moonbeam",
		estimatedWaitTime: 5,
		fullySupported: true,
		assets: [],
		txFeeInPercent: 0.1
	};

	constructor() {
		super();
		this.providerType = "moonbeam";
	}

}