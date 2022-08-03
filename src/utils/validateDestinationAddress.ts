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
    : bech32.decode(destinationAddress).prefix === targetChain?.addressPrefix;
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
    : targetChain?.addressPrefix && bech32.decode(destinationAddress).prefix === targetChain?.addressPrefix;
}
