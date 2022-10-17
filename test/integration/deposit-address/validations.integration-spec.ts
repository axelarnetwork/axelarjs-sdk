import { AxelarAssetTransfer } from "../../../src";
jest.setTimeout(20000);

describe("Validations - Testnet", () => {
  const sdk = new AxelarAssetTransfer({
    environment: "testnet",
  });

  describe("validateChainIdentifiers()", () => {
    let chainsValid: boolean;

    describe("when called", () => {
      beforeAll(async () => {
        chainsValid = await sdk.validateChainIdentifiers("avalanche", "ethereum-2");
      });

      it("should validate chain identifiers", () => {
        expect(chainsValid).toEqual(true);
      });
    });

    describe("when wrong identifier", () => {
      it("should throw error", () => {
        expect(sdk.validateChainIdentifiers("avalanche", "ethereum")).rejects.toThrow(
          "Invalid chain identifier for ethereum. Did you mean ethereum-2?"
        );
      });

      it("should throw error", () => {
        expect(sdk.validateChainIdentifiers("osmosis", "avalanche")).rejects.toThrow(
          "Invalid chain identifier for osmosis. Did you mean osmosis-4?"
        );
      });

      it("should throw error", () => {
        expect(sdk.validateChainIdentifiers("osmosis-4", "terra")).rejects.toThrow(
          "Invalid chain identifier for terra. Did you mean aura?"
        );
      });
    });
  });
});

describe("Validations - Mainnet", () => {
  const sdk = new AxelarAssetTransfer({
    environment: "mainnet",
  });

  describe("validateChainIdentifiers()", () => {
    let chainsValid: boolean;

    describe("when called", () => {
      beforeAll(async () => {
        chainsValid = await sdk.validateChainIdentifiers("avalanche", "ethereum");
      });

      it("should validate chain identifiers", () => {
        expect(chainsValid).toEqual(true);
      });
    });

    describe("when wrong identifier", () => {
      it("should throw error", () => {
        expect(sdk.validateChainIdentifiers("avalanche", "ethereum-2")).rejects.toThrow(
          "Invalid chain identifier for ethereum-2. Did you mean ethereum?"
        );
      });

      it("should throw error", () => {
        expect(sdk.validateChainIdentifiers("osmosis", "terra")).rejects.toThrow(
          "Invalid chain identifier for terra. Did you mean terra-2?"
        );
      });
    });
  });
});
