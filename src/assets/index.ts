import { AssetConfig } from "./types";

const environment =
  process.env.REACT_APP_STAGE || process.env.ENVIRONMENT || "";

if (!["local", "devnet", "testnet", "mainnet"].includes(environment as string))
  throw new Error(
    "You must have a REACT_APP_STAGE or ENVIRONMENT environment variable be set in your app to either 'devnet', 'testnet' or 'mainnet'"
  );

const testnet = {
  uaxl: {
    common_key: {
      devnet: "uaxl",
      testnet: "uaxl",
      mainnet: "uaxl",
    },
    native_chain: "axelar",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      axelar: {
        assetSymbol: "AXL",
        assetName: "AXL",
        minDepositAmt: 0.05,
      },
      moonbeam: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      fantom: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      ethereum: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      avalanche: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      polygon: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
    },
  },
  uusd: {
    common_key: {
      devnet: "uusd",
      testnet: "uusd",
      mainnet: "uusd",
    },
    native_chain: "terra",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      moonbeam: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      fantom: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      ethereum: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      avalanche: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      polygon: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      terra: {
        assetSymbol: "UST",
        assetName: "UST",
        minDepositAmt: 0.05,
      },
    },
  },
  uluna: {
    common_key: {
      devnet: "uluna",
      testnet: "uluna",
      mainnet: "uluna",
    },
    native_chain: "terra",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      moonbeam: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
      },
      fantom: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
      },
      ethereum: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
      },
      avalanche: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
      },
      polygon: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
      },
      terra: {
        assetSymbol: "LUNA",
        assetName: "LUNA",
        minDepositAmt: 0.0006,
      },
    },
  },
  "wmatic-wei": {
    common_key: {
      devnet: "wmatic-wei",
      testnet: "wmatic-wei",
      mainnet: "wmatic-wei",
    },
    native_chain: "polygon",
    fully_supported: true,
    decimals: 18,
    chain_aliases: {
      axelar: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.03,
      },
      moonbeam: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC (Axelar-wrapped)",
        minDepositAmt: 0.07,
      },
      fantom: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC (Axelar-wrapped)",
        minDepositAmt: 0.07,
      },
      ethereum: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC (Axelar-wrapped)",
        minDepositAmt: 0.07,
      },
      avalanche: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC (Axelar-wrapped)",
        minDepositAmt: 0.07,
      },
      polygon: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.07,
      },
      cosmoshub: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.03,
      },
      osmosis: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.03,
      },
      terra: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.03,
      },
    },
  },
  "wftm-wei": {
    common_key: {
      devnet: "wftm-wei",
      testnet: "wftm-wei",
      mainnet: "wftm-wei",
    },
    native_chain: "fantom",
    fully_supported: true,
    decimals: 18,
    chain_aliases: {
      axelar: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.04,
      },
      moonbeam: {
        assetSymbol: "WFTM",
        assetName: "WFTM (Axelar-wrapped)",
        minDepositAmt: 0.08,
      },
      fantom: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.08,
      },
      ethereum: {
        assetSymbol: "WFTM",
        assetName: "WFTM (Axelar-wrapped)",
        minDepositAmt: 0.08,
      },
      avalanche: {
        assetSymbol: "WFTM",
        assetName: "WFTM (Axelar-wrapped)",
        minDepositAmt: 0.08,
      },
      polygon: {
        assetSymbol: "WFTM",
        assetName: "WFTM (Axelar-wrapped)",
        minDepositAmt: 0.08,
      },
      cosmoshub: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.04,
      },
      osmosis: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.04,
      },
      terra: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.04,
      },
    },
  },
  "weth-wei": {
    common_key: {
      devnet: "weth-wei",
      testnet: "weth-wei",
      mainnet: "weth-wei",
    },
    native_chain: "ethereum",
    fully_supported: true,
    decimals: 18,
    chain_aliases: {
      axelar: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00002,
      },
      moonbeam: {
        assetSymbol: "WETH",
        assetName: "WETH (Axelar-wrapped)",
        minDepositAmt: 0.00004,
      },
      fantom: {
        assetSymbol: "WETH",
        assetName: "WETH (Axelar-wrapped)",
        minDepositAmt: 0.00004,
      },
      ethereum: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00004,
      },
      avalanche: {
        assetSymbol: "WETH",
        assetName: "WETH (Axelar-wrapped)",
        minDepositAmt: 0.00004,
      },
      polygon: {
        assetSymbol: "WETH",
        assetName: "WETH (Axelar-wrapped)",
        minDepositAmt: 0.00004,
      },
      cosmoshub: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00002,
      },
      osmosis: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00002,
      },
      terra: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00002,
      },
    },
  },
  "wavax-wei": {
    common_key: {
      devnet: "wavax-wei",
      testnet: "wavax-wei",
      mainnet: "wavax-wei",
    },
    native_chain: "avalanche",
    fully_supported: true,
    decimals: 18,
    chain_aliases: {
      axelar: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.0007,
      },
      moonbeam: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX (Axelar-wrapped)",
        minDepositAmt: 0.001,
      },
      fantom: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX (Axelar-wrapped)",
        minDepositAmt: 0.001,
      },
      ethereum: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX (Axelar-wrapped)",
        minDepositAmt: 0.001,
      },
      avalanche: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.001,
      },
      polygon: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX (Axelar-wrapped)",
        minDepositAmt: 0.001,
      },
      cosmoshub: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.0007,
      },
      osmosis: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.0007,
      },
      terra: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.0007,
      },
    },
  },
  "wdev-wei": {
    common_key: {
      devnet: "wdev-wei",
      testnet: "wdev-wei",
      mainnet: "wglmr-wei",
    },
    native_chain: "moonbeam",
    fully_supported: true,
    decimals: 18,
    chain_aliases: {
      axelar: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.02,
      },
      moonbeam: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.04,
      },
      fantom: {
        assetSymbol: "WDEV",
        assetName: "WDEV (Axelar-wrapped)",
        minDepositAmt: 0.04,
      },
      ethereum: {
        assetSymbol: "WDEV",
        assetName: "WDEV (Axelar-wrapped)",
        minDepositAmt: 0.04,
      },
      avalanche: {
        assetSymbol: "WDEV",
        assetName: "WDEV (Axelar-wrapped)",
        minDepositAmt: 0.04,
      },
      polygon: {
        assetSymbol: "WDEV",
        assetName: "WDEV (Axelar-wrapped)",
        minDepositAmt: 0.04,
      },
      cosmoshub: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.02,
      },
      osmosis: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.02,
      },
      terra: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.02,
      },
    },
  },
  uatom: {
    common_key: {
      devnet: "uatom",
      testnet: "uatom",
      mainnet: "uatom",
    },
    native_chain: "cosmoshub",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      moonbeam: {
        assetSymbol: "ATOM",
        assetName: "ATOM (Axelar-wrapped)",
        minDepositAmt: 0.004,
      },
      fantom: {
        assetSymbol: "ATOM",
        assetName: "ATOM (Axelar-wrapped)",
        minDepositAmt: 0.004,
      },
      ethereum: {
        assetSymbol: "ATOM",
        assetName: "ATOM (Axelar-wrapped)",
        minDepositAmt: 0.004,
      },
      avalanche: {
        assetSymbol: "ATOM",
        assetName: "ATOM (Axelar-wrapped)",
        minDepositAmt: 0.004,
      },
      polygon: {
        assetSymbol: "ATOM",
        assetName: "ATOM (Axelar-wrapped)",
        minDepositAmt: 0.004,
      },
      cosmoshub: {
        assetSymbol: "ATOM",
        assetName: "ATOM",
        minDepositAmt: 0.002,
      },
    },
  },
  uausdc: {
    common_key: {
      devnet: "uausdc",
      testnet: "uausdc",
      mainnet: "uausdc",
    },
    native_chain: "ethereum",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      axelar: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC",
        minDepositAmt: 0.05,
      },
      moonbeam: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      fantom: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      ethereum: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC",
        minDepositAmt: 0.1,
      },
      avalanche: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      polygon: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC (Axelar-wrapped)",
        minDepositAmt: 0.1,
      },
      cosmoshub: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC",
        minDepositAmt: 0.05,
      },
      osmosis: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC",
        minDepositAmt: 0.05,
      },
      terra: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC",
        minDepositAmt: 0.05,
      },
    },
  },
};

const mainnet = {
  uaxl: {
    common_key: {
      devnet: "uaxl",
      testnet: "uaxl",
      mainnet: "uaxl",
    },
    native_chain: "axelar",
    fully_supported: false,
    decimals: 6,
    chain_aliases: {
      axelar: {
        assetSymbol: "AXL",
        assetName: "AXL",
        minDepositAmt: 0.5,
      },
      moonbeam: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 1,
      },
      fantom: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 1,
      },
      ethereum: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 20,
      },
      avalanche: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 1,
      },
      polygon: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 1,
      },
    },
  },
  uusd: {
    common_key: {
      devnet: "uusd",
      testnet: "uusd",
      mainnet: "uusd",
    },
    native_chain: "terra",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      moonbeam: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 1,
      },
      fantom: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 1,
      },
      ethereum: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 20,
      },
      avalanche: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 1,
      },
      polygon: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 1,
      },
      terra: {
        assetSymbol: "UST",
        assetName: "UST",
        minDepositAmt: 0.5,
      },
    },
  },
  uluna: {
    common_key: {
      devnet: "uluna",
      testnet: "uluna",
      mainnet: "uluna",
    },
    native_chain: "terra",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      moonbeam: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.01,
      },
      fantom: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.01,
      },
      ethereum: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.2,
      },
      avalanche: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.01,
      },
      polygon: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.01,
      },
      terra: {
        assetSymbol: "LUNA",
        assetName: "LUNA",
        minDepositAmt: 0.006,
      },
    },
  },
};

export const allAssets: AssetConfig[] = Object.values(
  environment === "mainnet" ? mainnet : testnet
);
