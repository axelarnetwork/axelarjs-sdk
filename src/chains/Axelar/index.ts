import WaitingService                   from "./WaitingService";
import {IAssetInfo, IChain, IChainInfo} from "../../interface";
import {bech32}                         from "bech32";

export default class Axelar implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "AXL",
		chainName: "Axelar",
		estimatedWaitTime: 5,
		fullySupported: true,
		assets: [],
		txFeeInPercent: 0.1,
		module: "axelarnet"
	};

	public validateAddress = (addressInfo: IAssetInfo): boolean => {

		if (!(addressInfo?.assetAddress))
			return false;

		try {
			return bech32.decode(addressInfo.assetAddress).prefix === this.chainInfo.chainName.toLowerCase();
		} catch (e) {
			return false;
		}

	};

	public waitingService = (chainInfo: IChainInfo, assetInfo: IAssetInfo) => new WaitingService(chainInfo, assetInfo)

}