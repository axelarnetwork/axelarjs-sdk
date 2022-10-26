import { AxelarAssetTransfer, CHAINS } from "../../../src";
jest.setTimeout(20000);

const sdk = new AxelarAssetTransfer({
  environment: "testnet",
});
const evmAddress = "0xA57ADCE1d2fE72949E4308867D894CD7E7DE0ef2";

describe("Unwrap Native Asset", () => {
  describe("getDepositAddressForNativeWrap()", () => {
    let depositAddress: string;
    let intermediaryDepositAddress: string;

    beforeAll(async () => {
      const unwrap = await sdk.getDepositAddressForNativeUnwrap(
        CHAINS.TESTNET.AVALANCHE,
        CHAINS.TESTNET.FANTOM,
        evmAddress
      );
      depositAddress = unwrap.finalDepositAddress;
      intermediaryDepositAddress = unwrap.intermediaryDepositAddress;
    });

    describe("when called", () => {
      it("should return deposit address", () => {
        expect(depositAddress?.length).toBeGreaterThan(0);
        expect(intermediaryDepositAddress?.length).toBeGreaterThan(0);
        expect(depositAddress !== intermediaryDepositAddress);
      });
    });
  });
});
