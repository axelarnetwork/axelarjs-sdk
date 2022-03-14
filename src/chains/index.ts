import { AssetInfo, Chain } from "../interface";
import Axelar from "./Axelar";
import Ethereum from "./Ethereum";
import Avalanche from "./Avalanche";
import Terra from "./Terra";
import { allAssets, AssetConfig } from "../assets";
import Fantom from "./Fantom";
import Polygon from "./Polygon";
import Moonbeam from "./Moonbeam";
import Osmosis from "./Osmosis";
import Cosmos from "./Cosmos";

const rawChains: Chain[] = [
  new Axelar(),
  new Avalanche(),
  new Cosmos(),
  new Ethereum(),
  new Fantom(),
  new Moonbeam(),
  new Osmosis(),
  new Polygon(),
  new Terra(),
];

const environment =
  process.env.REACT_APP_STAGE || process.env.ENVIRONMENT || "";

if (!["local", "devnet", "testnet", "mainnet"].includes(environment as string))
  throw new Error(
    "You must have a REACT_APP_STAGE or ENVIRONMENT environment variable be set in your app to either 'devnet', 'testnet' or 'mainnet'"
  );

/*push assets to supported chains*/
rawChains.forEach(({ chainInfo }) => {
  const filteredAssetList: AssetConfig[] = allAssets.filter(
    ({ chain_aliases }) =>
      Object.keys(chain_aliases).indexOf(chainInfo.chainName.toLowerCase()) > -1
  );

  const assetsList: AssetInfo[] = [];

  filteredAssetList.forEach((asset) => {
    const assetToPush: AssetInfo =
      asset.chain_aliases[chainInfo.chainName.toLowerCase()];
    assetToPush.common_key = asset.common_key[environment];
    assetToPush.native_chain = asset.native_chain;
    assetToPush.decimals = asset.decimals;
    assetToPush.fullySupported = asset.fully_supported;
    assetsList.push(assetToPush);
  });

  chainInfo.assets = assetsList;
});

export { rawChains as ChainList };
