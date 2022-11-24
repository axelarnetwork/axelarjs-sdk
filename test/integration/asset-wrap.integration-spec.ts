import { AxelarAssetTransfer, Environment, EvmChain } from "../../src";

describe("Asset Wrap", () => {
  jest.setTimeout(20000);
  const axelarAssetTransfer = new AxelarAssetTransfer({
    environment: Environment.TESTNET,
  });

  test("bootstrap", () => {
    expect(axelarAssetTransfer).toBeDefined();
  });

  describe("getDepositAddressForNativeWrap()", () => {
    let result: any;

    beforeAll(async () => {
      result = await axelarAssetTransfer.getDepositAddressForNativeWrap(
        "ethereum-2",
        EvmChain.MOONBEAM,
        "0xa411977dd24F1547065C6630E468a43275cB4d7f",
        ""
      );
    });

    it("should generate unique deposit addresses", () => {
      console.log({ result });
    });
  });
});
