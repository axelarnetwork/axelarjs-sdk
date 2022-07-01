import { AssetConfig, LoadAssetConfig } from "./types";
import { mainnet } from "./mainnet.assets";
import { testnet } from "./testnet.assets";
import { devnet } from "./devnet.assets";
import { Environment } from "src/libs";

const assetMap: Record<Environment, any> = { devnet, testnet, mainnet };

export function loadAssets(config: LoadAssetConfig): AssetConfig[] {
  return Object.values(assetMap[config.environment]);
}
