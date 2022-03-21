import { loadChains } from "../chains";

export function validateDestinationAddress(
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
