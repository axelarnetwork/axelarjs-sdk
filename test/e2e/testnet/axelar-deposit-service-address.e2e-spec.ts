import { ethers } from "ethers";
import { AxelarDepositServiceAPI } from "../../../src";

describe("[TESTNET] - Axelar Deposit Service E2E", () => {
  jest.setTimeout(60000);
  let api: AxelarDepositServiceAPI;

  beforeAll(() => {
    api = AxelarDepositServiceAPI.init(ethers.providers.getDefaultProvider("goerli"));
  });

  it("should get erc20 deposit address", async () => {
    const address = await api.getErc20DepositAddress(
      "0x0000000000000000000000000000000000000000",
      "avalanche",
      "0x0000000000000000000000000000000000000000",
      "aUSDC"
    );

    expect(address).toBe("0x8B52504Be53f16ef24578280Fb4677F7bF6B4748");
  });
});
