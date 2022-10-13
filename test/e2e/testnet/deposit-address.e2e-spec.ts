import { AxelarAssetTransfer } from "../../../src";

describe("[TESTNET] - Deposit Address E2E", () => {
  jest.setTimeout(60000);
  let transferSdk: AxelarAssetTransfer;

  beforeAll(() => {
    transferSdk = new AxelarAssetTransfer({
      environment: "testnet",
    });
  });

  it("init", () => {
    expect(transferSdk).toBeDefined();
  });

  describe("AxelarAssetTransfer.getDepositAddress()", () => {
    describe("evm -> evm", () => {
      describe("moonbeam -> avalanche", () => {
        let address: string;
        beforeAll(async () => {
          address = await transferSdk.getDepositAddress(
            "moonbeam",
            "avalanche",
            "0xA57ADCE1d2fE72949E4308867D894CD7E7DE0ef2",
            "uausdc"
          );
        });

        it("should return deposit address", () => {
          expect(typeof address).toBe("string");
          expect(address.length).toBeGreaterThan(0);
        });
      });
      describe("avalanche -> moonbeam", () => {
        let address: string;
        beforeAll(async () => {
          address = await transferSdk.getDepositAddress(
            "avalanche",
            "moonbeam",
            "0xA57ADCE1d2fE72949E4308867D894CD7E7DE0ef2",
            "uausdc"
          );
        });

        it("should return deposit address", () => {
          expect(typeof address).toBe("string");
          expect(address.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
