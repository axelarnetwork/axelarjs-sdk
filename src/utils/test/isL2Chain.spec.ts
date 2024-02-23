import { Environment, FeeToken } from "../../libs";
import { isL2Chain } from "../isL2Chain";

const mockFeeToken: FeeToken = {
  gas_price: "1893353954513",
  decimals: 18,
  name: "Avalanche",
  symbol: "AVAX",
  token_price: {
    usd: 20.56,
  },
  l1_gas_price_in_units: {
    decimals: 18,
    value: "1",
  },
};

describe("isL2Chain", () => {
  it("should return true if the chain is an L2 chain", async () => {
    const environment = Environment.MAINNET;
    const l2Chain = await isL2Chain(environment, "arbitrum", mockFeeToken);
    expect(l2Chain).toBeTruthy();
  });

  it("should return false if dest token.l1_gas_price_in_units is undefined", async () => {
    const environment = Environment.MAINNET;
    const l2Chain = await isL2Chain(environment, "arbitrum", {
      ...mockFeeToken,
      l1_gas_price_in_units: undefined,
    });
    expect(l2Chain).toBeFalsy();
  });
});
