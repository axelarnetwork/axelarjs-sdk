import { loadChains } from "../chains";
import { Environment, FeeToken } from "../libs";

export async function isL2Chain(
  environment: Environment,
  chain: string,
  destinationNativeToken: FeeToken
) {
  const chains = await loadChains({ environment });
  const evmChains = chains.filter((chain) => chain.module === "evm").map((chain) => chain.id);
  return destinationNativeToken.l1_gas_price_in_units && evmChains.includes(chain);
}
