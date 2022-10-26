import { AxelarAssetTransfer } from "../../../src";

describe("AxelarAssetTransfer", () => {
  jest.setTimeout(20000);
  let sdk: AxelarAssetTransfer;

  beforeAll(() => {
    sdk = new AxelarAssetTransfer({
      environment: "testnet",
    });
  });

  describe("getDepositAddressForNativeWrap()", () => {
    let address: string;
    beforeAll(async () => {
      address = await sdk.getDepositAddressForNativeWrap(
        "avalanche",
        "ethereum-2",
        "0xA57ADCE1d2fE72949E4308867D894CD7E7DE0ef2"
      );
    });

    it("should get native deposit address", () => {
      expect(address).toBeTruthy();
      console.log({
        address,
      });
    });
  });

  describe("getDepositAddressForNativeUnwrap()", () => {
    let depositAddress: string;
    beforeAll(async () => {
      const result = await sdk.getDepositAddressForNativeUnwrap(
        "moonbeam",
        "avalanche",
        "0xA57ADCE1d2fE72949E4308867D894CD7E7DE0ef2"
      );
      depositAddress = result;
    });

    it("should get native deposit address", () => {
      expect(depositAddress).toBeTruthy();
    });
  });
});
