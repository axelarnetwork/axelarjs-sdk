import { CHAINS, Environment, throwIfInvalidChainIds } from "../../../src";

vitest.setConfig({
  testTimeout: 20000,
});

describe("Validations - Testnet", () => {
  const environment = Environment.TESTNET;
  describe("validateChainIdentifiers()", () => {
    describe("when called", () => {
      it("should validate chain identifiers", () => {
        expect(
          throwIfInvalidChainIds([CHAINS.TESTNET.AVALANCHE, CHAINS.TESTNET.ETHEREUM], environment)
        ).resolves.toBeUndefined();
      });
    });

    describe("when wrong identifier", () => {
      it("should throw error", () => {
        expect(
          throwIfInvalidChainIds([CHAINS.TESTNET.AVALANCHE, "ethereum"], environment)
        ).rejects.toThrow("Invalid chain identifier for ethereum. Did you mean ethereum-2?");
      });

      it("should throw error", () => {
        expect(
          throwIfInvalidChainIds(["osmosis", CHAINS.TESTNET.AVALANCHE], environment)
        ).rejects.toThrow("Invalid chain identifier for osmosis. Did you mean osmosis-4?");
      });

      it("should throw error", () => {
        expect(
          throwIfInvalidChainIds([CHAINS.TESTNET.OSMOSIS, "terra"], environment)
        ).rejects.toThrow("Invalid chain identifier for terra. Did you mean terra-3?");
      });
    });
  });
});

describe("Validations - Mainnet", () => {
  const environment = Environment.MAINNET;
  describe("validateChainIdentifiers()", () => {
    describe("when called", () => {
      it("should validate chain identifiers", () => {
        expect(
          throwIfInvalidChainIds([CHAINS.MAINNET.AVALANCHE, CHAINS.MAINNET.ETHEREUM], environment)
        ).resolves.toBeUndefined();
      });
    });

    describe("when wrong identifier", () => {
      it("should throw error", () => {
        expect(
          throwIfInvalidChainIds([CHAINS.MAINNET.AVALANCHE, "ethereum-2"], environment)
        ).rejects.toThrow("Invalid chain identifier for ethereum-2. Did you mean ethereum?");
      });

      it("should throw error", () => {
        expect(
          throwIfInvalidChainIds([CHAINS.MAINNET.OSMOSIS, "terra"], environment)
        ).rejects.toThrow("Invalid chain identifier for terra. Did you mean terra-2?");
      });
    });
  });
});
