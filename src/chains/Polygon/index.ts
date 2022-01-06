import {IChain, IChainInfo} from "../../interface";
import Ethereum             from "../Ethereum";

export default class Polygon extends Ethereum implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "POLYGON",
		chainName: "Polygon",
		estimatedWaitTime: 5,
		fullySupported: true,
		assets: [],
		txFeeInPercent: 0.1,
		module: "evm"
	};

	constructor() {
		super();
		this.providerType = "polygon";
	}

}