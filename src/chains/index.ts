export * from "./supported-chains-list";

import fetch from "cross-fetch";
import { loadAssets } from "../assets";
import { AssetConfig, AssetInfo } from "../assets/types";
import { ChainInfo, LoadChainConfig } from "./types";
import cloneDeep from "clone-deep";
import { Environment } from "../libs";

export async function loadChains(config: LoadChainConfig) {
  const allAssets = await loadAssets(config);
  const _environment = config.environment as Environment;

  const rawChains: ChainInfo[] = await importChains({ environment: _environment });

  /*push assets to supported chains*/
  rawChains.forEach((chainInfo) => {
    const filteredAssetList: AssetConfig[] = allAssets.filter(
      ({ chain_aliases }) =>
        Object.keys(chain_aliases).indexOf(chainInfo.chainName.toLowerCase()) > -1
    );

    const assetsList: AssetInfo[] = [];

    filteredAssetList.forEach((asset) => {
      const assetToPush: AssetInfo = cloneDeep(
        asset.chain_aliases[chainInfo.chainName.toLowerCase()]
      );
      assetToPush.common_key = asset.common_key[_environment];
      assetToPush.native_chain = asset.native_chain;
      assetToPush.decimals = asset.decimals;
      assetToPush.fullySupported = asset.fully_supported;
      assetsList.push(assetToPush);
    });

    chainInfo.assets = assetsList;
  });

  return rawChains;
}

const urlMap: Record<Environment, string> = {
  devnet: "https://axelar-testnet.s3.us-east-2.amazonaws.com/devnet-chain-config.json",
  testnet: "https://axelar-testnet.s3.us-east-2.amazonaws.com/testnet-chain-config.json",
  mainnet: "https://axelar-mainnet.s3.us-east-2.amazonaws.com/mainnet-chain-config.json",
};
const chainMap: Record<Environment, any> = { devnet: null, testnet: null, mainnet: null };

export async function importChains(config: LoadChainConfig): Promise<ChainInfo[]> {
  if (chainMap[config.environment]) return Object.values(chainMap[config.environment]);

  chainMap[config.environment] = await execGet(urlMap[config.environment]);

  return Object.values(chainMap[config.environment]);
}

async function execGet(url: string) {
  return fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .catch((error) => {
      throw error;
    });
}
