import {IAssetInfo, IChain, IChainInfo} from "../../interface";
import Axelar                           from "../Axelar";
import {AccAddress}                     from '@terra-money/terra.js'

export default class Terra extends Axelar implements IChain {

	public chainInfo: IChainInfo = {
		chainSymbol: "Terra",
		chainName: "Terra",
		estimatedWaitTime: 5,
		fullySupported: true,
		assets: []
	};

	constructor() {
		super();
	}

	public validateAddress = (addressInfo: IAssetInfo) => AccAddress.validate(addressInfo.assetAddress as string);

}