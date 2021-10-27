import {IAssetInfo, IChain} from "../interface";
import {ChainList}          from "../chains";

const validatorsDict: { [chainSymbol: string]: (asset: IAssetInfo) => boolean } = {};
ChainList.forEach((chain: IChain) => {
	const key = chain.chainInfo.chainSymbol.toLowerCase();
	validatorsDict[key] = chain.validateAddress as (asset: IAssetInfo) => boolean
})

export const validateDestinationAddress = (chainSymbol: string, destTokenInfo: IAssetInfo): boolean => {

	const validator: (assetInfo: IAssetInfo) => boolean = validatorsDict[chainSymbol?.toLowerCase()];

	// TODO: what should we do if we don't have a validator for supported chain?
	if (!validator)
		return true;

	return validator(destTokenInfo);

}