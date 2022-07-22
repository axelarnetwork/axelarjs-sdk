import Axelar from "./Axelar";
import Ethereum from "./Ethereum";
import Avalanche from "./Avalanche";
import Terra from "./Terra";
import Fantom from "./Fantom";
import Polygon from "./Polygon";
import Moonbeam from "./Moonbeam";
import Osmosis from "./Osmosis";
import Cosmoshub from "./Cosmoshub";
import Injective from "./Injective";
import Juno from "./Juno";
import { loadAssets } from "../assets";
import { AssetConfig, AssetInfo } from "../assets/types";
import { Chain, LoadChainConfig } from "./types";
import cloneDeep from "clone-deep";
import Crescent from "./Crescent";
import EMoney from "./EMoney";
import Binance from "./Binance";
import Kujira from "./Kujira";
import Sei from "./Sei";
import Secret from "./Secret";
import Aurora from "./Aurora";

export function loadChains(config: LoadChainConfig) {
  const allAssets = loadAssets(config);
  const _environment = config.environment as string;

  const rawChains: Chain[] = [
    new Aurora(),
    new Axelar(),
    new Avalanche(),
    new Binance(),
    new Cosmoshub(),
    new Crescent(),
    new Ethereum(),
    new EMoney(),
    new Fantom(),
    new Injective(),
    new Juno(),
    new Kujira(),
    new Moonbeam(),
    new Osmosis(),
    new Polygon(),
    new Secret(),
    new Sei(),
    new Terra(),
  ];

  /*push assets to supported chains*/
  rawChains.forEach(({ chainInfo }) => {
    const filteredAssetList: AssetConfig[] = allAssets.filter(
      ({ chain_aliases }) =>
        Object.keys(chain_aliases).indexOf(chainInfo.chainName.toLowerCase()) > -1
    );

    const assetsList: AssetInfo[] = [];

    filteredAssetList.forEach((asset) => {
      const assetToPush: AssetInfo = cloneDeep(
        asset.chain_aliases[chainInfo.chainName.toLowerCase()]
      );
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
