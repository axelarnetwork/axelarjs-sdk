import { AxelarAssetTransfer, CHAINS } from "../../../src";
jest.setTimeout(20000);

const sdk = new AxelarAssetTransfer({
  environment: "testnet",
});
const evmAddress = "0xA57ADCE1d2fE72949E4308867D894CD7E7DE0ef2";

describe("Unwrap Native Asset", () => {
  describe("getDepositAddressForNativeWrap()", () => {
    let depositAddress: string;

    beforeAll(async () => {
      const result = await sdk.getDepositAddressForNativeUnwrap(
        CHAINS.TESTNET.AVALANCHE,
        CHAINS.TESTNET.FANTOM,
        evmAddress
      );
      depositAddress = result;
    });

    describe("when called", () => {
      it("should return deposit address", () => {
        expect(depositAddress).toBeTruthy();
      });
    });
  });
});
