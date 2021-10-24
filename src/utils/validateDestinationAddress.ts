import ChainList            from "../chains/ChainList";
import {IAssetInfo, IChain} from "../interface";

const validatorsDict: { [chainSymbol: string]: (asset: IAssetInfo) => boolean } = {};
ChainList.forEach((chain: IChain) => {
	const key = chain.chainInfo.chainSymbol.toLowerCase();
	validatorsDict[key] = chain.validateAddress as (asset: IAssetInfo) => boolean
})

export const validateDestinationAddress = (destTokenInfo: IAssetInfo): boolean => {

	const destTokenSymbol: string = destTokenInfo?.assetSymbol as string;
	const validator: (assetInfo: IAssetInfo) => boolean = validatorsDict[destTokenSymbol?.toLowerCase()];

	// TODO: what should we do if we don't have a validator for supported chain?
	if (!validator)
		return true;

	return validator(destTokenInfo);

}