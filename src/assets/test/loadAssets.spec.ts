import { Environment } from "../../libs";
import { loadAssets } from "..";

const mock = {
  loadAssets: loadAssets,
};

describe("loadAssets()", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
    vitest.spyOn(mock, "loadAssets");
  });

  describe("when loadAssets is called with known env, but not mainnet", () => {
    beforeEach(() => {
      mock.loadAssets({
        environment: Environment.TESTNET,
      });
    });

    test("then it should call loadAssets", () => {
      expect(mock.loadAssets).toHaveBeenCalledWith({ environment: Environment.TESTNET });
    });

    // test("then it should return assets", () => {
    //   expect(mock.loadAssets).toHaveReturnedWith(Object.values(testnet));
    // });
  });

  describe("when loadAssets is called with mainnet", () => {
    beforeEach(() => {
      mock.loadAssets({
        environment: Environment.MAINNET,
      });
    });

    test("then it should call loadAssets", () => {
      expect(mock.loadAssets).toHaveBeenCalledWith({ environment: Environment.MAINNET });
    });

    // test("then it should return assets", () => {
    //   expect(mock.loadAssets).toHaveReturnedWith(Object.values(mainnet));
    // });
  });
});
