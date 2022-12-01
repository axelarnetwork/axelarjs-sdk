import { ethers } from "ethers";
import { AxelarDepositServiceAPI, Environment } from "../../../src";

describe("[TESTNET] - Axelar Deposit Service E2E", () => {
  jest.setTimeout(60000);
  let api: AxelarDepositServiceAPI;

  beforeAll(async () => {
    api = await AxelarDepositServiceAPI.init(
      Environment.TESTNET,
      ethers.providers.getDefaultProvider("goerli")
    );
  });

  it("should get erc20 deposit address", async () => {
    const response = await api
      .connect(ethers.providers.getDefaultProvider("goerli"))
      .getErc20DepositAddress(
        "ethereum-2",
        "avalanche",
        "0x0000000000000000000000000000000000000000",
        "aUSDC",
        "0x0000000000000000000000000000000000000000"
      );

    expect(response).toEqual({
      success: true,
      data: {
        depositAddress: "0x8B52504Be53f16ef24578280Fb4677F7bF6B4748",
        waitForDeposit: expect.any(Function),
      },
    });
  });

  it("should get erc20 deposit address and be able to forward it to the gateway contract", async () => {});
});
