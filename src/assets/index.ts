import { AssetConfig, LoadAssetConfig } from "./types";
import fetch from "node-fetch";

const allowedEnvironments = ["local", "devnet", "testnet", "mainnet"];

let fetchedAssets: AssetConfig[] | null;

export async function loadAssets(
  config: LoadAssetConfig
): Promise<AssetConfig[]> {
  if (!fetchedAssets) {
    fetchedAssets = await fetchAssets(config);
  }

  return Object.values(fetchedAssets);
}

export async function fetchAssets(
  config: LoadAssetConfig
): Promise<AssetConfig[]> {
  const _environment =
    config.environment === "local" ? "testnet" : config.environment;

  if (!_environment || !allowedEnvironments.includes(_environment)) {
    const joinedEnvs = allowedEnvironments.join("|");

    const error = new Error();
    error.name = "Environment not allowed";
    error.message = `Provided environment ${_environment} not in ${joinedEnvs}`;
    throw error;
  }

  const url = `https://raw.githubusercontent.com/axelarnetwork/axelarate-community/main/resources/${_environment}/assets.json`;

  const assets = await fetch(url)
    .then((response) => {
      if (!response.ok) throw response;
      return response;
    })
    .then((response) => response.json())
    .catch(async (err) => {
      const _err = await err.json();
      throw {
        fullMessage: _err.message,
      };
    });

  // console.log("assets downloaded for environment", assets);

  return assets;
}
