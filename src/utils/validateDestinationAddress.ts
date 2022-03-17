import { AssetInfo } from "../assets/types";
import { loadChains } from "../chains";
import { Chain } from "../chains/types";

export const validateDestinationAddress = (
  chainSymbol: string,
  destTokenInfo: AssetInfo,
  environment: string
): boolean => {
  const validatorsDict: {
    [chainSymbol: string]: (asset: AssetInfo) => boolean;
  } = {};

  const chains = loadChains({
    environment,
  });

  chains.forEach((chain: Chain) => {
    const key = chain.chainInfo.chainSymbol.toLowerCase();
    validatorsDict[key] = chain.validateAddress as (
      asset: AssetInfo
    ) => boolean;
  });

  const validator: (assetInfo: AssetInfo) => boolean =
    validatorsDict[chainSymbol?.toLowerCase()];

  if (!validator) return false;

  return validator(destTokenInfo);
};
