import { Environment } from "../../libs";
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
        environment: Environment.TESTNET,
      });
    });

    test("then it should call loadChains", () => {
      expect(mock.loadChains).toHaveBeenCalledWith({ environment: Environment.TESTNET });
    });

    test("then it should return assets", () => {
      expect(mock.loadChains).toHaveReturned();
    });
  });

  describe("when loadChains is called with mainnet", () => {
    beforeEach(() => {
      mock.loadChains({
        environment: Environment.MAINNET,
      });
    });

    test("then it should call loadChains", () => {
      expect(mock.loadChains).toHaveBeenCalledWith({ environment: "mainnet" });
    });

    test("then it should return assets", () => {
      expect(mock.loadChains).toHaveReturned();
    });
  });
});
