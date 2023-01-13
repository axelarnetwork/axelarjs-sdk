import { AxelarAssetTransfer, CHAINS, Environment } from "../../../src";
jest.setTimeout(20000);

const sdk = new AxelarAssetTransfer({
  environment: Environment.TESTNET,
});
const evmAddress = "0xA57ADCE1d2fE72949E4308867D894CD7E7DE0ef2";
const evmAsset = "uausdc";

describe("EVM - EVM", () => {
  describe("getDepositAddress()", () => {
    let depositAddress: string;

    beforeAll(async () => {
      depositAddress = await sdk.getDepositAddress(
        CHAINS.TESTNET.AVALANCHE,
        CHAINS.TESTNET.ETHEREUM,
        evmAddress,
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
