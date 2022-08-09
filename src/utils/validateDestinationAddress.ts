import { Environment } from "../libs";
import { loadChains } from "../chains";
import { isAddress } from "ethers/lib/utils";
import { bech32 } from "bech32";

export async function validateDestinationAddressByChainSymbol(
  chainSymbol: string,
  destinationAddress: string,
  environment: Environment
) {
  const chains = await loadChains({
    environment,
  });

  const targetChain = chains.find(
    (chainInfo) => chainInfo.chainSymbol.toLowerCase() === chainSymbol.toLowerCase()
  );

  return targetChain?.module === "evm"
    ? isAddress(destinationAddress)
    : destinationAddress && targetChain?.addressPrefix && checkPrefix(destinationAddress, targetChain?.addressPrefix);
}

export async function validateDestinationAddressByChainName(
  chainName: string,
  destinationAddress: string,
  environment: Environment
) {
  const chains = await loadChains({
    environment,
  });

  const targetChain = chains.find(
    (chainInfo) => chainInfo.chainName.toLowerCase() === chainName.toLowerCase()
  );

  return targetChain?.module === "evm"
    ? isAddress(destinationAddress)
    : destinationAddress && targetChain?.addressPrefix && checkPrefix(destinationAddress, targetChain?.addressPrefix);
}

const checkPrefix = (address: string, addressPrefix: string): boolean => {
  if (!address) return false;

  try {
    return bech32.decode(address).prefix === addressPrefix;
  } catch (e) {
    return false;
  }
};