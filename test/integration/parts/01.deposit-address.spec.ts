import { AxelarAssetTransfer, Environment } from "../../../src";

/**
 * This test helps to check that a unique deposit address is generated for parallel requests
 * if the source chain is different but that the destination chain is the same
 */

describe("Parallel Deposit Address Generation", () => {
  jest.setTimeout(30000);
  let axelarAssetTransferTestnet: any;
  let axelarAssetTransferMainnet: any;

  beforeAll(() => {
    axelarAssetTransferTestnet = new AxelarAssetTransfer({
      environment: Environment.TESTNET,
    });
    axelarAssetTransferMainnet = new AxelarAssetTransfer({
      environment: Environment.MAINNET,
    });
  });

  test("bootstrap", () => {
    expect(axelarAssetTransferTestnet).toBeDefined();
  });

  describe("deposit address generation", () => {
    it("should generate unique deposit addresses", async () => {
      const results = await Promise.all([
        axelarAssetTransferTestnet.getDepositAddress(
          "avalanche",
          "moonbeam",
          "0xB8Cd93C83A974649D76B1c19f311f639e62272BC",
          "uausdc"
        ),
        axelarAssetTransferTestnet.getDepositAddress(
          "fantom",
          "moonbeam",
          "0xB8Cd93C83A974649D76B1c19f311f639e62272BC",
          "uausdc"
        ),
        axelarAssetTransferTestnet.getDepositAddress(
          "osmosis",
          "moonbeam",
          "0xB8Cd93C83A974649D76B1c19f311f639e62272BC",
          "uausdc"
        ),
        axelarAssetTransferTestnet.getDepositAddress(
          "comdex",
          "moonbeam",
          "0xB8Cd93C83A974649D76B1c19f311f639e62272BC",
          "uausdc"
        ),
        axelarAssetTransferTestnet.getDepositAddress(
          "moonbeam",
          "osmosis",
          "osmo1x3z2vepjd7fhe30epncxjrk0lehq7xdqe8ltsn",
          "uausdc"
        ),
      ]);
      expect(results.length).toBe(5);
      expect(results[0]).not.toEqual(results[1]);
    });

    xit("should be able to generate deposit addresses when the source chain is cosmos-based chain", async () => {
      const results = await Promise.all([
        axelarAssetTransferMainnet.getDepositAddress(
          "terra",
          "moonbeam",
          "0xB8Cd93C83A974649D76B1c19f311f639e62272BC",
          "uusdc"
        ),
        axelarAssetTransferMainnet.getDepositAddress(
          "axelar",
          "osmosis",
          "osmo1x3z2vepjd7fhe30epncxjrk0lehq7xdqe8ltsn",
          "uusdc"
        ),
        axelarAssetTransferMainnet.getDepositAddress(
          "osmosis",
          "axelar",
          "axelar1dn9534a72h733m8andex5ufklql3hfsv8gdsrc",
          "uusdc"
        ),
      ]);
      console.log(results);
      expect(results.length).toBe(3);
    });
  });
});
