import { AxelarAssetTransfer, Environment } from "../../../src";

describe("Single Deposit Address Generation", () => {
  jest.setTimeout(20000);

  const axelarAssetTransfer = new AxelarAssetTransfer({
    environment: Environment.TESTNET,
    // overwriteResourceUrl: "http://localhost:4000",
  });

  test("bootstrap", () => {
    expect(axelarAssetTransfer).toBeDefined();
  });

  describe("deposit address generation", () => {
    let result: string;

    beforeAll(async () => {
      result = await axelarAssetTransfer.getDepositAddress(
        "avalanche",
        "ethereum",
        "0xB8Cd93C83A974649D76B1c19f311f639e62272BC",
        "uausdc"
      );
    });

    it("should generate unique deposit addresses", () => {
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(1);
    });
  });
});
