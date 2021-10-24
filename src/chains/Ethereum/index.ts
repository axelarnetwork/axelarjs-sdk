import WaitingService                   from "./WaitingService";
import {isAddress as isValidEVMAddress} from "ethers/lib/utils";
import {IAssetInfo, IChain, IChainInfo} from "../../interface";

export default class Ethereum implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "ETH",
		chainName: "Ethereum",
		assets: [
			{assetSymbol: "uaxl", assetName: "Axelar"},
			{assetSymbol: "axelarPHOT", assetName: "Photon"},
		]
	};

	constructor() {
	}

	public validateAddress = (addressInfo: IAssetInfo) => isValidEVMAddress(addressInfo.assetAddress as string);

	public waitingService = (chainInfo: IChainInfo, assetInfo: IAssetInfo) => new WaitingService(chainInfo, assetInfo)
}