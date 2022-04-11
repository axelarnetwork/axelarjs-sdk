import { fetchAssets, loadAssets } from "..";

const mock = {
  loadAssets: loadAssets,
};

describe("loadAssets()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(mock, "loadAssets");
  });

  describe("when loadAssets is called with known env, but not mainnet", () => {
    beforeEach(() => {
      mock.loadAssets({
        environment: "testnet",
      });
    });

    test("then it should call loadAssets", () => {
      expect(mock.loadAssets).toHaveBeenCalledWith({ environment: "testnet" });
    });

    // test("then it should return assets", async () => {
    //   expect(mock.loadAssets).toHaveReturnedWith(Object.values(await fetchAssets({ environment: "testnet"})));
    // });
  });

  describe("when loadAssets is called with mainnet", () => {
    beforeEach(() => {
      mock.loadAssets({
        environment: "mainnet",
      });
    });

    test("then it should call loadAssets", () => {
      expect(mock.loadAssets).toHaveBeenCalledWith({ environment: "mainnet" });
    });

    // test("then it should return assets", async () => {
    //   expect(mock.loadAssets).toHaveReturnedWith(Object.values(await fetchAssets({ environment: "mainnet"})));
    // });
  });

  describe("when loadAssets is called with unknown env", () => {
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

    test("then it should call loadAssets", () => {
      expect(mock.loadAssets).toHaveBeenCalledWith({ environment: "axelar" });
    });

    test("then it should return assets", () => {
      expect(error.name).toBe("Environment not allowed");
      expect(error.message).toBe(
        "Provided environment axelar not in local|devnet|testnet|mainnet"
      );
    });
  });

  describe("when loadAssets is called with empty env", () => {
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

    test("then it should call loadAssets", () => {
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
