import { AxelarAssetTransfer, Environment } from "../../../src";

/**
 * This test helps to check that a unique deposit address is generated for parallel requests
 * if the source chain is different but that the destination chain is the same
 */
export const depositAddressSingle = () => {
  jest.setTimeout(60000);
  const axelarAssetTransfer = new AxelarAssetTransfer({
    environment: Environment.TESTNET,
  });

  test("bootstrap", () => {
    expect(axelarAssetTransfer).toBeDefined();
  });

  describe("deposit address generation", () => {
    let result: string;

    beforeAll(async () => {
      result = await axelarAssetTransfer.getDepositAddress(
        "avalanche",
        "moonbeam",
        "0xB8Cd93C83A974649D76B1c19f311f639e62272BC",
        "uausdc"
      );
    });

    it("should generate unique deposit addresses", () => {
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(1);
    });
  });
};
