import { AssetInfo } from "../../../src";
import Terra from "../../../src/chains/Terra";

let terraChain: Terra;
let asset: AssetInfo;

beforeEach(() => {
  terraChain = new Terra();
  asset = { assetAddress: "" };
});

test("destination address validation", () => {
  const addressMap: { [key: string]: string } = {
    validAddr44: "terra1d5umjr4j0k8c8qtd500mzw2f99kptqqxw2rzph",
    invalidAddr44: "terra1d5umjr4j0k8c8qtd500mzw2f99kptqqxw2rzpd",
  };

  asset.assetAddress = addressMap.validAddr44;
  expect(terraChain.validateAddress(asset.assetAddress)).toBe(true);

  asset.assetAddress = addressMap.invalidAddr44;
  expect(terraChain.validateAddress(asset.assetAddress)).toBe(false);
});
