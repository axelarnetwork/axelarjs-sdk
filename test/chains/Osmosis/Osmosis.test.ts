import Osmosis from "../../../src/chains/Osmosis";
import { AssetInfo } from "../../../src/interface";

let osmosisChain: Osmosis;
let asset: AssetInfo;

beforeEach(() => {
  osmosisChain = new Osmosis();
  asset = { assetAddress: "" };
});

test("destination address validation", () => {
  const addressMap: { [key: string]: string } = {
    validAddr44: "osmo1gr5meft5dwe4sg3swwsfysm4k93upt3v0srskj",
    invalidAddr44: "osmo1gr5meft5dwe4sg3swwsfysm4k93upt3v0srskd",
  };

  asset.assetAddress = addressMap.validAddr44;
  expect(osmosisChain.validateAddress(asset)).toBe(true);

  asset.assetAddress = addressMap.invalidAddr44;
  expect(osmosisChain.validateAddress(asset)).toBe(false);
});
