import { Environment, FeeToken } from "../libs";

export async function isL2Chain(
  environment: Environment,
  chain: string,
  destinationNativeToken: FeeToken
) {
  return destinationNativeToken.l1_gas_price_in_units;
}
