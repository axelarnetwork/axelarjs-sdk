import fetch from "cross-fetch";
import { AssetConfig, LoadAssetConfig } from "./types";
import { Environment } from "../libs";

const urlMap: Record<Environment, string> = {
  "devnet-amplifier": "https://axelar-testnet.s3.us-east-2.amazonaws.com/devnet-asset-config.json",
  testnet: "https://axelar-testnet.s3.us-east-2.amazonaws.com/testnet-asset-config.json",
  mainnet: "https://axelar-mainnet.s3.us-east-2.amazonaws.com/mainnet-asset-config.json",
};
const assetMap: Record<Environment, any> = {
  "devnet-amplifier": null,
  testnet: null,
  mainnet: null,
};

export async function loadAssets(config: LoadAssetConfig): Promise<AssetConfig[]> {
  if (assetMap[config.environment]) return Object.values(assetMap[config.environment]);

  assetMap[config.environment] = await execGet(urlMap[config.environment]);

  return Object.values(assetMap[config.environment]);
}

async function execGet(url: string) {
  return fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .catch((error) => {
      console.log({ error });
      throw error;
    });
}
