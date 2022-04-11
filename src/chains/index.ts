import Axelar from "./Axelar";
import Ethereum from "./Ethereum";
import Avalanche from "./Avalanche";
import Terra from "./Terra";
import Fantom from "./Fantom";
import Polygon from "./Polygon";
import Moonbeam from "./Moonbeam";
import Osmosis from "./Osmosis";
import Cosmoshub from "./Cosmoshub";
import Juno from "./Juno";
import { loadAssets } from "../assets";
import { AssetConfig, AssetInfo } from "../assets/types";
import { Chain, LoadChainConfig } from "./types";
import { cloneDeep } from "lodash";
import Crescent from "./Crescent";

const rawChains: Chain[] = [
  new Axelar(),
  new Avalanche(),
  new Cosmoshub(),
  new Crescent(),
  new Ethereum(),
  new Fantom(),
  new Juno(),
  new Moonbeam(),
  new Osmosis(),
  new Polygon(),
  new Terra(),
];


export async function loadChains(config: LoadChainConfig) {
  const allAssets = await loadAssets(config);
  const _environment = config.environment as string;

  /*push assets to supported chains*/
  rawChains.forEach(({ chainInfo }) => {
    const filteredAssetList: AssetConfig[] = allAssets.filter(
      ({ chain_aliases }) =>
        Object.keys(chain_aliases).indexOf(chainInfo.chainName.toLowerCase()) >
        -1
    );

    const assetsList: AssetInfo[] = [];

    filteredAssetList.forEach((asset) => {
      const assetToPush: AssetInfo = cloneDeep(asset.chain_aliases[chainInfo.chainName.toLowerCase()]);
      assetToPush.common_key =
        asset.common_key[_environment === "local" ? "testnet" : _environment];
      assetToPush.native_chain = asset.native_chain;
      assetToPush.decimals = asset.decimals;
      assetToPush.fullySupported = asset.fully_supported;
      assetsList.push(assetToPush);
    });

    chainInfo.assets = assetsList;
  });

  return rawChains;
}
