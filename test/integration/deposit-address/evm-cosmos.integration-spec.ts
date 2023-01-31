import { AxelarAssetTransfer, CHAINS, Environment } from "../../../src";

const sdk = new AxelarAssetTransfer({
  environment: Environment.MAINNET,
});
const cosmosAddress = "terra1u8xlzsfuxe0lv6u2ws2zymrnnlc9pmyynu7pym";
const evmAsset = "uusdc";

describe(
  "EVM - COSMOS",
  () => {
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
  },
  {
    timeout: 20000,
  }
);
