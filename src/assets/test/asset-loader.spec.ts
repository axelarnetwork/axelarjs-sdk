import { loadAssets } from "..";
import { mainnet } from "../mainnet.assets";
import { testnet } from "../testnet.assets";

const mock = {
  loadAssets: loadAssets,
};

describe("assetLoader()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(mock, "loadAssets");
  });

  describe("when assetLoader is called with known env, but not mainnet", () => {
    beforeEach(() => {
      mock.loadAssets({
        environment: "testnet",
      });
    });

    test("then it should call assetLoader", () => {
      expect(mock.loadAssets).toHaveBeenCalledWith({ environment: "testnet" });
    });

    test("then it should return assets", () => {
      expect(mock.loadAssets).toHaveReturnedWith(Object.values(testnet));
    });
  });

  describe("when assetLoader is called with mainnet", () => {
    beforeEach(() => {
      mock.loadAssets({
        environment: "mainnet",
      });
    });

    test("then it should call assetLoader", () => {
      expect(mock.loadAssets).toHaveBeenCalledWith({ environment: "mainnet" });
    });

    test("then it should return assets", () => {
      expect(mock.loadAssets).toHaveReturnedWith(Object.values(mainnet));
    });
  });

  describe("when assetLoader is called with unknown env", () => {
    let error: Error;
    beforeEach(() => {
      try {
        mock.loadAssets({
          environment: "axelar",
        });
      } catch (_error: any) {
        error = _error;
      }
    });

    test("then it should call assetLoader", () => {
      expect(mock.loadAssets).toHaveBeenCalledWith({ environment: "axelar" });
    });

    test("then it should return assets", () => {
      expect(error.name).toBe("Environment not allowed");
      expect(error.message).toBe(
        "Provided environment axelar not in local|devnet|testnet|mainnet"
      );
    });
  });

  describe("when assetLoader is called with empty env", () => {
    let error: Error;
    beforeEach(() => {
      try {
        mock.loadAssets({
          environment: "",
        });
      } catch (_error: any) {
        error = _error;
      }
    });

    test("then it should call assetLoader", () => {
      expect(mock.loadAssets).toHaveBeenCalledWith({ environment: "" });
    });

    test("then it should return assets", () => {
      expect(error.name).toBe("Environment not allowed");
      expect(error.message).toBe(
        "Provided environment undefined not in local|devnet|testnet|mainnet"
      );
    });
  });
});
