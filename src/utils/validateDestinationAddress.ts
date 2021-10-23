import {IAsset}                         from "../constants";
import {isAddress as isValidEVMAddress} from "ethers/lib/utils";
import {validate as isValidBTCAddress}  from "bitcoin-address-validation";

/*
TODO: this dict should eventually be migrated into a centralized const in the consts directory
 along with other data definitions for easier configuration
* */
const validatorsDict: { [destTokenSymbol: string]: (destTokenAddr: string) => boolean } = {};
validatorsDict["btc"] = (destTokenAddr: string) => isValidBTCAddress(destTokenAddr);
validatorsDict["eth"] = (destTokenAddr: string) => isValidEVMAddress(destTokenAddr);

export const validateDestinationAddress = (destTokenInfo: IAsset): boolean => {

	const destTokenSymbol: string = destTokenInfo?.assetSymbol as string;
	const destTokenAddr: string = destTokenInfo?.assetAddress as string;
	const validator: (destTokenSymbol: string) => boolean = validatorsDict[destTokenSymbol?.toLowerCase()];

	if (!validator)
		return true; // TODO: what should we do if we don't have a validator for supported chain?

	return validator(destTokenAddr);

}