import { AssetConfig, LoadAssetConfig } from "./types";
import { Environment } from "../libs";

const urlMap: Record<Environment, string> = {
  devnet: "https://axelar-testnet.s3.us-east-2.amazonaws.com/testnet-asset-config.json", //TODO
  testnet: "https://axelar-testnet.s3.us-east-2.amazonaws.com/testnet-asset-config.json",
  mainnet: "https://axelar-testnet.s3.us-east-2.amazonaws.com/testnet-asset-config.json" //TODO
}
const assetMap: Record<Environment, any> = { devnet: null, testnet: null, mainnet: null };

export async function loadAssets(config: LoadAssetConfig): Promise<AssetConfig[]> {
  if (assetMap[config.environment]) 
    return Object.values(assetMap[config.environment]);

  assetMap[config.environment] = await execGet(urlMap[config.environment]);

  console.log("assets for environment",assetMap[config.environment])

  return Object.values(assetMap[config.environment]);
}
async function execGet(base: string) {
  return await fetch(base, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((res) => res.data);
}