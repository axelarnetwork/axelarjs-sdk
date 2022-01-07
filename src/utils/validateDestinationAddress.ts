import {AssetInfo, Chain} from "../interface";
import {ChainList}        from "../chains";

const validatorsDict: { [chainSymbol: string]: (asset: AssetInfo) => boolean } = {};
ChainList.forEach((chain: Chain) => {
	const key = chain.chainInfo.chainSymbol.toLowerCase();
	validatorsDict[key] = chain.validateAddress as (asset: AssetInfo) => boolean
})

export const validateDestinationAddress = (chainSymbol: string, destTokenInfo: AssetInfo): boolean => {

	const validator: (assetInfo: AssetInfo) => boolean = validatorsDict[chainSymbol?.toLowerCase()];

	if (!validator)
		return false;

	return validator(destTokenInfo);

}