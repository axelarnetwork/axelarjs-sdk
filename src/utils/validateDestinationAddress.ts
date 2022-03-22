import { loadChains } from "../chains";

export function validateDestinationAddressByChainSymbol(
  chainSymbol: string,
  destinationAddress: string,
  environment: string
) {
  const chains = loadChains({
    environment,
  });

  const targetChain = chains.find(
    (_chain) =>
      _chain.chainInfo.chainSymbol.toLowerCase() === chainSymbol.toLowerCase()
  );

  return targetChain?.validateAddress(destinationAddress);
}

export function validateDestinationAddressByChainName(
  chainName: string,
  destinationAddress: string,
  environment: string
) {
  const chains = loadChains({
    environment,
  });

  const targetChain = chains.find(
    (_chain) =>
      _chain.chainInfo.chainName.toLowerCase() === chainName.toLowerCase()
  );

  return targetChain?.validateAddress(destinationAddress);
}
