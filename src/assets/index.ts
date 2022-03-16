import { AssetInfo } from "../interface";

const environment =
  process.env.REACT_APP_STAGE || process.env.ENVIRONMENT || "";

if (!["local", "devnet", "testnet", "mainnet"].includes(environment as string))
  throw new Error(
    "You must have a REACT_APP_STAGE or ENVIRONMENT environment variable be set in your app to either 'devnet', 'testnet' or 'mainnet'"
  );

export interface AssetInfoForChain extends AssetInfo {
  minDepositAmt: number;
}

export interface AssetConfig {
  common_key: { [env: string]: string };
  native_chain: string;
  fully_supported: boolean;
  decimals: number;
  chain_aliases: { [key: string]: AssetInfoForChain };
}

const luna_terra: AssetConfig = {
  common_key: {
    devnet: "uluna",
    testnet: "uluna",
    mainnet: "uluna",
  },
  native_chain: "terra",
  fully_supported: true,
  decimals: 6,
  chain_aliases: {
    axelar: {
      assetSymbol: "LUNA",
      assetName: "LUNA",
      minDepositAmt: 0.0006,
    },
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
      minDepositAmt: 0.006,
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
    cosmoshub: {
      assetSymbol: "LUNA",
      assetName: "LUNA",
      minDepositAmt: 0.0006,
    },
    osmosis: {
      assetSymbol: "LUNA",
      assetName: "LUNA",
      minDepositAmt: 0.0006,
    },
    terra: { assetSymbol: "LUNA", assetName: "LUNA", minDepositAmt: 0.0006 },
  },
};

const ust_terra: AssetConfig = {
  common_key: {
    devnet: "uusd",
    testnet: "uusd",
    mainnet: "uusd",
  },
  native_chain: "terra",
  fully_supported: true,
  decimals: 6,
  chain_aliases: {
    axelar: {
      assetSymbol: "UST",
      assetName: "UST",
      minDepositAmt: 0.05,
    },
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
      minDepositAmt: 0.5,
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
    cosmoshub: {
      assetSymbol: "UST",
      assetName: "UST",
      minDepositAmt: 0.05,
    },
    osmosis: {
      assetSymbol: "UST",
      assetName: "UST",
      minDepositAmt: 0.05,
    },
    terra: { assetSymbol: "UST", assetName: "UST", minDepositAmt: 0.05 },
  },
};

const axl_axelar: AssetConfig = {
  common_key: {
    devnet: "uaxl",
    testnet: "uaxl",
    mainnet: "uaxl",
  },
  native_chain: "axelar",
  fully_supported: false,
  decimals: 6,
  chain_aliases: {
    axelar: { assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 0.05 },
    avalanche: { assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 0.1 },
    ethereum: { assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 0.5 },
    fantom: { assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 0.1 },
    moonbeam: { assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 0.1 },
    polygon: { assetSymbol: "AXL", assetName: "Axelar", minDepositAmt: 0.1 },
    cosmoshub: {
      assetSymbol: "AXL",
      assetName: "AXL",
      minDepositAmt: 0.05,
    },
    osmosis: {
      assetSymbol: "AXL",
      assetName: "AXL",
      minDepositAmt: 0.05,
    },
  },
};

const usdc_fake: AssetConfig = {
  common_key: {
    devnet: "uusdc",
    testnet: "uusdc",
    mainnet: "uusdc",
  },
  native_chain: "ethereum",
  fully_supported: false,
  decimals: 6,
  chain_aliases: {
    axelar: {
      assetSymbol: "USDC.fake",
      assetName: "USDC.fake",
      minDepositAmt: 10,
    },
    avalanche: {
      assetSymbol: "USDC.fake",
      assetName: "USDC.fake",
      minDepositAmt: 10,
    },
    ethereum: {
      assetSymbol: "USDC.fake",
      assetName: "USDC.fake",
      minDepositAmt: 10,
    },
    fantom: {
      assetSymbol: "USDC.fake",
      assetName: "USDC.fake",
      minDepositAmt: 10,
    },
    moonbeam: {
      assetSymbol: "USDC.fake",
      assetName: "USDC.fake",
      minDepositAmt: 10,
    },
    osmosis: {
      assetSymbol: "USDC.fake",
      assetName: "USDC.fake",
      minDepositAmt: 10,
    },
    polygon: {
      assetSymbol: "USDC.fake",
      assetName: "USDC.fake",
      minDepositAmt: 10,
    },
  },
};

const atom_cosmoshub: AssetConfig = {
  common_key: {
    devnet: "uatom",
    testnet: "uatom",
    mainnet: "uatom",
  },
  native_chain: "cosmoshub",
  fully_supported: true,
  decimals: 6,
  chain_aliases: {
    axelar: {
      assetSymbol: "ATOM",
      assetName: "ATOM",
      minDepositAmt: 0.002,
    },
    moonbeam: {
      assetSymbol: "ATOM",
      assetName: "ATOM (Axelar-wrapped)",
      minDepositAmt: 0.003,
    },
    fantom: {
      assetSymbol: "ATOM",
      assetName: "ATOM (Axelar-wrapped)",
      minDepositAmt: 0.003,
    },
    ethereum: {
      assetSymbol: "ATOM",
      assetName: "ATOM (Axelar-wrapped)",
      minDepositAmt: 0.02,
    },
    avalanche: {
      assetSymbol: "ATOM",
      assetName: "ATOM (Axelar-wrapped)",
      minDepositAmt: 0.003,
    },
    polygon: {
      assetSymbol: "ATOM",
      assetName: "ATOM (Axelar-wrapped)",
      minDepositAmt: 0.003,
    },
    cosmoshub: {
      assetSymbol: "ATOM",
      assetName: "ATOM",
      minDepositAmt: 0.002,
    },
    osmosis: {
      assetSymbol: "ATOM",
      assetName: "ATOM",
      minDepositAmt: 0.002,
    },
  },
};

const weth_ethereum: AssetConfig = {
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
      minDepositAmt: 2e-5,
    },
    moonbeam: {
      assetSymbol: "WETH",
      assetName: "WETH (Axelar-wrapped)",
      minDepositAmt: 4e-5,
    },
    fantom: {
      assetSymbol: "WETH",
      assetName: "WETH (Axelar-wrapped)",
      minDepositAmt: 4e-5,
    },
    ethereum: {
      assetSymbol: "WETH",
      assetName: "WETH",
      minDepositAmt: 0.0002,
    },
    avalanche: {
      assetSymbol: "WETH",
      assetName: "WETH (Axelar-wrapped)",
      minDepositAmt: 4e-5,
    },
    polygon: {
      assetSymbol: "WETH",
      assetName: "WETH (Axelar-wrapped)",
      minDepositAmt: 4e-5,
    },
    cosmoshub: {
      assetSymbol: "WETH",
      assetName: "WETH",
      minDepositAmt: 2e-5,
    },
    osmosis: {
      assetSymbol: "WETH",
      assetName: "WETH",
      minDepositAmt: 2e-5,
    },
  },
};

const wavax_avalanche: AssetConfig = {
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
      minDepositAmt: 0.007,
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
  },
};

const wmatic_polygon: AssetConfig = {
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
      minDepositAmt: 0.3,
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
  },
};

const wftm_fantom: AssetConfig = {
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
      minDepositAmt: 0.4,
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
  },
};

const glmrName = environment === "mainnet" ? "WGLMR" : "WDEV";
const wglmr_moonbeam: AssetConfig = {
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
      assetSymbol: glmrName,
      assetName: glmrName + " (Axelar-wrapped)",
      minDepositAmt: 0.02,
    },
    avalanche: {
      assetSymbol: glmrName,
      assetName: glmrName + " (Axelar-wrapped)",
      minDepositAmt: 0.04,
    },
    ethereum: {
      assetSymbol: glmrName,
      assetName: glmrName + " (Axelar-wrapped)",
      minDepositAmt: 0.2,
    },
    fantom: {
      assetSymbol: glmrName,
      assetName: glmrName + " (Axelar-wrapped)",
      minDepositAmt: 0.04,
    },
    moonbeam: {
      assetSymbol: glmrName,
      assetName: glmrName,
      minDepositAmt: 0.04,
    },
    osmosis: {
      assetSymbol: glmrName,
      assetName: glmrName + " (Axelar-wrapped)",
      minDepositAmt: 0.02,
    },
    polygon: {
      assetSymbol: glmrName,
      assetName: glmrName + " (Axelar-wrapped)",
      minDepositAmt: 0.02,
    },
  },
};

const uausdc = {
  common_key: {
    devnet: "uausdc",
    testnet: "uausdc",
    mainnet: "uausdc",
  },
  native_chain: "ethereum",
  fully_supported: true,
  decimals: 6,
  chain_aliases: {
    moonbeam: {
      assetSymbol: "aUSDC",
      assetName: "aUSDC (Axelar-wrapped)",
      minDepositAmt: 1.0,
    },
    fantom: {
      assetSymbol: "aUSDC",
      assetName: "aUSDC (Axelar-wrapped)",
      minDepositAmt: 1.0,
    },
    ethereum: {
      assetSymbol: "aUSDC",
      assetName: "aUSDC",
      minDepositAmt: 20.0,
    },
    avalanche: {
      assetSymbol: "aUSDC",
      assetName: "aUSDC (Axelar-wrapped)",
      minDepositAmt: 1.0,
    },
    polygon: {
      assetSymbol: "aUSDC",
      assetName: "aUSDC (Axelar-wrapped)",
      minDepositAmt: 1.0,
    },
  },
};

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
    fully_supported: true,
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

export const allAssets: AssetConfig[] = Object.values(environment === "mainnet" ? mainnet : testnet)