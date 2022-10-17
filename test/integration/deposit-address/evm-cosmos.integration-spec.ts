import { AxelarAssetTransfer } from "../../../src";
jest.setTimeout(20000);

const sdk = new AxelarAssetTransfer({
  environment: "testnet",
});
const cosmosAddress = "osmo1x3z2vepjd7fhe30epncxjrk0lehq7xdqe8ltsn";
const evmAsset = "uausdc";

describe("EVM - COSMOS", () => {
  describe("getDepositAddress()", () => {
    let depositAddress: string;

    beforeAll(async () => {
      depositAddress = await sdk.getDepositAddress(
        "avalanche",
        "osmosis-4",
        cosmosAddress,
        evmAsset
      );
    });

    describe("when called", () => {
      it("should return deposit address", () => {
        expect(depositAddress?.length).toBeGreaterThan(0);
      });
    });
  });
});
