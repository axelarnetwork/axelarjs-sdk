import Terra from "../../../src/chains/Terra";
import { AssetInfo } from "../../../src/interface";

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
  expect(terraChain.validateAddress(asset)).toBe(true);

  asset.assetAddress = addressMap.invalidAddr44;
  expect(terraChain.validateAddress(asset)).toBe(false);
});
