import { AxelarAssetTransfer, CHAINS } from "../../../src";
jest.setTimeout(20000);

const sdk = new AxelarAssetTransfer({
  environment: "mainnet",
});
const cosmosAddress = "terra1u8xlzsfuxe0lv6u2ws2zymrnnlc9pmyynu7pym";
const evmAsset = "uusdc";

describe("EVM - COSMOS", () => {
  describe("getDepositAddress()", () => {
    let depositAddress: string;

    beforeAll(async () => {
      depositAddress = await sdk.getDepositAddress(
        CHAINS.MAINNET.AVALANCHE,
        CHAINS.MAINNET.TERRA,
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
