import { loadChains } from "..";

const mock = {
  loadChains: loadChains,
};

describe("loadChains()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(mock, "loadChains");
  });

  describe("when loadChains is called with known env, but not mainnet", () => {
    beforeEach(() => {
      mock.loadChains({
        environment: "testnet",
      });
    });

    test("then it should call loadChains", () => {
      expect(mock.loadChains).toHaveBeenCalledWith({ environment: "testnet" });
    });

    test("then it should return assets", () => {
      expect(mock.loadChains).toHaveReturned();
    });
  });

  describe("when loadChains is called with mainnet", () => {
    beforeEach(() => {
      mock.loadChains({
        environment: "mainnet",
      });
    });

    test("then it should call loadChains", () => {
      expect(mock.loadChains).toHaveBeenCalledWith({ environment: "mainnet" });
    });

    test("then it should return assets", () => {
      expect(mock.loadChains).toHaveReturned();
    });
  });

  describe("when loadChains is called with unknown envs", () => {
    let error: Error;

    beforeEach(() => {
      try {
        mock.loadChains({
          environment: "axelar",
        });
      } catch (_error: any) {
        error = _error;
      }
    });

    test("then it should call loadChains", () => {
      expect(mock.loadChains).toHaveBeenCalledWith({ environment: "axelar" });
    });

    test("then it should return assets", () => {
      expect(error.name).toBe("Environment not allowed");
      expect(error.message).toBe(
        "Provided environment axelar not in local|devnet|testnet|mainnet"
      );
    });
  });

  describe("when loadChains is called with empty env", () => {
    let error: Error;

    beforeEach(() => {
      try {
        mock.loadChains({
          environment: "",
        });
      } catch (_error: any) {
        error = _error;
      }
    });

    test("then it should call loadChains", () => {
      expect(mock.loadChains).toHaveBeenCalledWith({ environment: "" });
    });

    test("then it should return assets", () => {
      expect(error.name).toBe("Environment not allowed");
      expect(error.message).toBe(
        "Provided environment undefined not in local|devnet|testnet|mainnet"
      );
    });
  });
});
