import { AssetConfig } from "./types";
import { mainnet } from "./mainnet.assets";
import { testnet } from "./testnet.assets";

const environment =
  process.env.REACT_APP_STAGE || process.env.ENVIRONMENT || "";

if (!["local", "devnet", "testnet", "mainnet"].includes(environment as string))
  throw new Error(
    "You must have a REACT_APP_STAGE or ENVIRONMENT environment variable be set in your app to either 'devnet', 'testnet' or 'mainnet'"
  );

export const allAssets: AssetConfig[] = Object.values(
  environment === "mainnet" ? mainnet : testnet
);
