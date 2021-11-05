import {IChain, IChainInfo} from "../../interface";
import Ethereum             from "../Ethereum";

export default class Avalanche extends Ethereum implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "AVAX",
		chainName: "Avalanche",
		noteOnWaitTimes: "Confirmations on Avalanche can take upwards of 30 minutes or more",
		assets: [
			{assetSymbol: "AXL", assetName: "Axelar"},
			{assetSymbol: "axelarUST", assetName: "UST"},
			{assetSymbol: "axelarLUNA", assetName: "LUNA"},
		]
	};

	constructor() {
		super();
	}

}