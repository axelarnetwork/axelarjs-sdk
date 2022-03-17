import { AssetConfig, LoadAssetConfig } from "./types";
import { mainnet } from "./mainnet.assets";
import { testnet } from "./testnet.assets";

const allowedEnvironments = ["local", "devnet", "testnet", "mainnet"];

export function loadAssets(config: LoadAssetConfig): AssetConfig[] {
  // handle empty string case
  const _environment = config.environment || undefined;

  if (!_environment || !allowedEnvironments.includes(_environment)) {
    const joinedEnvs = allowedEnvironments.join("|");

    const error = new Error();
    error.name = "Environment not allowed";
    error.message = `Provided environment ${_environment} not in ${joinedEnvs}`;
    throw error;
  }

  const assets = config.environment === "mainnet" ? mainnet : testnet;

  return Object.values(assets);
}
