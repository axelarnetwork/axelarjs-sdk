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
        ibcDenom: "uaxl",
      },
      moonbeam: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uaxl",
      },
      fantom: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uaxl",
      },
      ethereum: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uaxl",
      },
      avalanche: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uaxl",
      },
      polygon: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uaxl",
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
        ibcDenom: "uusd",
      },
      fantom: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uusd",
      },
      ethereum: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uusd",
      },
      avalanche: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uusd",
      },
      polygon: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uusd",
      },
      terra: {
        assetSymbol: "UST",
        assetName: "UST",
        minDepositAmt: 0.05,
        ibcDenom: "uusd",
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
        ibcDenom: "uluna",
      },
      fantom: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "uluna",
      },
      ethereum: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "uluna",
      },
      avalanche: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "uluna",
      },
      polygon: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "uluna",
      },
      terra: {
        assetSymbol: "LUNA",
        assetName: "LUNA",
        minDepositAmt: 0.0006,
        ibcDenom: "uluna",
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
        ibcDenom: "wmatic-wei",
      },
      moonbeam: {
        assetSymbol: "axlWMATIC",
        assetName: "axlWMATIC",
        minDepositAmt: 0.07,
        ibcDenom: "wmatic-wei",
      },
      fantom: {
        assetSymbol: "axlWMATIC",
        assetName: "axlWMATIC",
        minDepositAmt: 0.07,
        ibcDenom: "wmatic-wei",
      },
      ethereum: {
        assetSymbol: "axlWMATIC",
        assetName: "axlWMATIC",
        minDepositAmt: 0.07,
        ibcDenom: "wmatic-wei",
      },
      avalanche: {
        assetSymbol: "axlWMATIC",
        assetName: "axlWMATIC",
        minDepositAmt: 0.07,
        ibcDenom: "wmatic-wei",
      },
      polygon: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.07,
        ibcDenom: "wmatic-wei",
      },
      cosmoshub: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.03,
        ibcDenom:
          "ibc/C31901B8CB873F83E5B383CABAC2133135E786BDE25380616E4B0DB5B8F08F3D",
      },
      osmosis: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.03,
        ibcDenom:
          "ibc/AAA3E023F151BA8331D1FA73D21260840BB756EF30101BBEE36843AAB6E30B9E",
      },
      terra: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.03,
        ibcDenom:
          "ibc/58F8CEBA3C40A6EE70548B0011077FF9D12882D53FDF908E71A1F0A99E834212",
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
        ibcDenom: "wftm-wei",
      },
      moonbeam: {
        assetSymbol: "axlWFTM",
        assetName: "axlWFTM",
        minDepositAmt: 0.08,
        ibcDenom: "wftm-wei",
      },
      fantom: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.08,
        ibcDenom: "wftm-wei",
      },
      ethereum: {
        assetSymbol: "axlWFTM",
        assetName: "axlWFTM",
        minDepositAmt: 0.08,
        ibcDenom: "wftm-wei",
      },
      avalanche: {
        assetSymbol: "axlWFTM",
        assetName: "axlWFTM",
        minDepositAmt: 0.08,
        ibcDenom: "wftm-wei",
      },
      polygon: {
        assetSymbol: "axlWFTM",
        assetName: "axlWFTM",
        minDepositAmt: 0.08,
        ibcDenom: "wftm-wei",
      },
      cosmoshub: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.04,
        ibcDenom:
          "ibc/49745E2A5A7D2F9CDB90491FB11D78B1DAE86D92404AAD6DC2DA11152A609CD0",
      },
      osmosis: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.04,
        ibcDenom:
          "ibc/DDCE954AC7E084CFB19799F897C3846A6FF94FC5A4DF94CFFD9118BFBD86DC25",
      },
      terra: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.04,
        ibcDenom:
          "ibc/AE5B3E33916FD05550C7D178F87F2564D5F7FF527059C5996BE8309470A61291",
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
        ibcDenom: "weth-wei",
      },
      moonbeam: {
        assetSymbol: "axlWETH",
        assetName: "axlWETH",
        minDepositAmt: 0.00004,
        ibcDenom: "weth-wei",
      },
      fantom: {
        assetSymbol: "axlWETH",
        assetName: "axlWETH",
        minDepositAmt: 0.00004,
        ibcDenom: "weth-wei",
      },
      ethereum: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00004,
        ibcDenom: "weth-wei",
      },
      avalanche: {
        assetSymbol: "axlWETH",
        assetName: "axlWETH",
        minDepositAmt: 0.00004,
        ibcDenom: "weth-wei",
      },
      polygon: {
        assetSymbol: "axlWETH",
        assetName: "axlWETH",
        minDepositAmt: 0.00004,
        ibcDenom: "weth-wei",
      },
      cosmoshub: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00002,
        ibcDenom:
          "ibc/375BC04D74C122624097D38B5D8449D2883D8EC4BB21A94F1C936EB454B02048",
      },
      osmosis: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00002,
        ibcDenom:
          "ibc/29BCC56593641DF5447428ACB7965998DD32A25DC813DAB82D48FF851835B5B0",
      },
      terra: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00002,
        ibcDenom:
          "ibc/9339521B35444B4BF36D76BEBC97CC5921346A020AA1C99A7084CA068D3D2CFC",
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
        ibcDenom: "wavax-wei",
      },
      moonbeam: {
        assetSymbol: "axlWAVAX",
        assetName: "axlWAVAX",
        minDepositAmt: 0.001,
        ibcDenom: "wavax-wei",
      },
      fantom: {
        assetSymbol: "axlWAVAX",
        assetName: "axlWAVAX",
        minDepositAmt: 0.001,
        ibcDenom: "wavax-wei",
      },
      ethereum: {
        assetSymbol: "axlWAVAX",
        assetName: "axlWAVAX",
        minDepositAmt: 0.001,
        ibcDenom: "wavax-wei",
      },
      avalanche: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.001,
        ibcDenom: "wavax-wei",
      },
      polygon: {
        assetSymbol: "axlWAVAX",
        assetName: "axlWAVAX",
        minDepositAmt: 0.001,
        ibcDenom: "wavax-wei",
      },
      cosmoshub: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.0007,
        ibcDenom:
          "ibc/4786D3D8B8AC06B085F0C017742861F121F67501347149A054CAB77D24ECA49D",
      },
      osmosis: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.0007,
        ibcDenom:
          "ibc/724FBF119B7302FC6C27483EBCD3E8F0DD289F64A17FF7D6A9B3FE20E23341C3",
      },
      terra: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.0007,
        ibcDenom:
          "ibc/3C74F6660E46281F2E85B35DC0ED2E2752AD6B36486FFA96CCA3F1FCE9BCDB16",
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
        ibcDenom: "wdev-wei",
      },
      moonbeam: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.04,
        ibcDenom: "wdev-wei",
      },
      fantom: {
        assetSymbol: "axlWDEV",
        assetName: "axlWDEV",
        minDepositAmt: 0.04,
        ibcDenom: "wdev-wei",
      },
      ethereum: {
        assetSymbol: "axlWDEV",
        assetName: "axlWDEV",
        minDepositAmt: 0.04,
        ibcDenom: "wdev-wei",
      },
      avalanche: {
        assetSymbol: "axlWDEV",
        assetName: "axlWDEV",
        minDepositAmt: 0.04,
        ibcDenom: "wdev-wei",
      },
      polygon: {
        assetSymbol: "axlWDEV",
        assetName: "axlWDEV",
        minDepositAmt: 0.04,
        ibcDenom: "wdev-wei",
      },
      cosmoshub: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.02,
        ibcDenom:
          "ibc/FD0B436BB2E3095C04E67481D4C7F03FABC9C0A85FFC0FBA8CFCE9C8FBCBB0F3",
      },
      osmosis: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.02,
        ibcDenom:
          "ibc/24D41AD3F7BF7EECAB5302741309362F9AD6B8315CDBF2B1AE8186876D43EE9A",
      },
      terra: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.02,
        ibcDenom:
          "ibc/01BE3FD11D199491ED3F43DEFBFC2D2216449DF5444621E48100DD4B544176C8",
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
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.004,
        ibcDenom: "uatom",
      },
      fantom: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.004,
        ibcDenom: "uatom",
      },
      ethereum: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.004,
        ibcDenom: "uatom",
      },
      avalanche: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.004,
        ibcDenom: "uatom",
      },
      polygon: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.004,
        ibcDenom: "uatom",
      },
      cosmoshub: {
        assetSymbol: "ATOM",
        assetName: "ATOM",
        minDepositAmt: 0.002,
        ibcDenom: "uatom",
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
        ibcDenom: "uausdc",
      },
      moonbeam: {
        assetSymbol: "axlaUSDC",
        assetName: "axlaUSDC",
        minDepositAmt: 0.1,
        ibcDenom: "uausdc",
      },
      fantom: {
        assetSymbol: "axlaUSDC",
        assetName: "axlaUSDC",
        minDepositAmt: 0.1,
        ibcDenom: "uausdc",
      },
      ethereum: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC",
        minDepositAmt: 0.1,
        ibcDenom: "uausdc",
      },
      avalanche: {
        assetSymbol: "axlaUSDC",
        assetName: "axlaUSDC",
        minDepositAmt: 0.1,
        ibcDenom: "uausdc",
      },
      polygon: {
        assetSymbol: "axlaUSDC",
        assetName: "axlaUSDC",
        minDepositAmt: 0.1,
        ibcDenom: "uausdc",
      },
      cosmoshub: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC",
        minDepositAmt: 0.05,
        ibcDenom:
          "ibc/EF4FF7AE2FCBABA9660E8A843271F495194A667AD5853F5162F99D5C9CC26AB5",
      },
      osmosis: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC",
        minDepositAmt: 0.05,
        ibcDenom:
          "ibc/7F0EA6F92B5AEBF95A0464FD969A8684B564C77E2FA2AF1F6CF5836A83D513AF",
      },
    },
  },
};

const mainnet = {
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
      axelar: {
        assetSymbol: "UST",
        assetName: "UST",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/6F4968A73F90CF7DE6394BF937D6DF7C7D162D74D839C13F53B41157D315E05F",
      },
      moonbeam: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 1,
        ibcDenom: "uusd",
      },
      fantom: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 1,
        ibcDenom: "uusd",
      },
      ethereum: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 20,
        ibcDenom: "uusd",
      },
      avalanche: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 1,
        ibcDenom: "uusd",
      },
      polygon: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 1,
        ibcDenom: "uusd",
      },
      terra: {
        assetSymbol: "UST",
        assetName: "UST",
        minDepositAmt: 0.5,
        ibcDenom: "uusd",
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
      axelar: {
        assetSymbol: "LUNA",
        assetName: "LUNA",
        minDepositAmt: 0.005,
        ibcDenom:
          "ibc/4627AD2524E3E0523047E35BB76CC90E37D9D57ACF14F0FCBCEB2480705F3CB8",
      },
      moonbeam: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.01,
        ibcDenom: "uluna",
      },
      fantom: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.01,
        ibcDenom: "uluna",
      },
      ethereum: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.2,
        ibcDenom: "uluna",
      },
      avalanche: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.01,
        ibcDenom: "uluna",
      },
      polygon: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.01,
        ibcDenom: "uluna",
      },
      terra: {
        assetSymbol: "LUNA",
        assetName: "LUNA",
        minDepositAmt: 0.005,
        ibcDenom: "uluna",
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
      axelar: {
        assetSymbol: "ATOM",
        assetName: "ATOM",
        minDepositAmt: 0.02,
        ibcDenom:
          "ibc/9117A26BA81E29FA4F78F57DC2BD90CD3D26848101BA880445F119B22A1E254E",
      },
      moonbeam: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.04,
        ibcDenom: "uatom",
      },
      fantom: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.04,
        ibcDenom: "uatom",
      },
      ethereum: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.7,
        ibcDenom: "uatom",
      },
      avalanche: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.04,
        ibcDenom: "uatom",
      },
      polygon: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.04,
        ibcDenom: "uatom",
      },
      cosmoshub: {
        assetSymbol: "ATOM",
        assetName: "ATOM",
        minDepositAmt: 0.02,
        ibcDenom: "uatom",
      },
    },
  },
  uusdc: {
    common_key: {
      devnet: "uusdc",
      testnet: "uusdc",
      mainnet: "uusdc",
    },
    native_chain: "ethereum",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      axelar: {
        assetSymbol: "USDC",
        assetName: "USDC",
        minDepositAmt: 0.5,
        ibcDenom: "uusdc",
      },
      moonbeam: {
        assetSymbol: "axlUSDC",
        assetName: "axlUSDC",
        minDepositAmt: 1,
        ibcDenom: "uusdc",
      },
      fantom: {
        assetSymbol: "axlUSDC",
        assetName: "axlUSDC",
        minDepositAmt: 1,
        ibcDenom: "uusdc",
      },
      ethereum: {
        assetSymbol: "USDC",
        assetName: "USDC",
        minDepositAmt: 20,
        ibcDenom: "uusdc",
      },
      avalanche: {
        assetSymbol: "axlUSDC",
        assetName: "axlUSDC",
        minDepositAmt: 1,
        ibcDenom: "uusdc",
      },
      polygon: {
        assetSymbol: "axlUSDC",
        assetName: "axlUSDC",
        minDepositAmt: 1,
        ibcDenom: "uusdc",
      },
      cosmoshub: {
        assetSymbol: "USDC",
        assetName: "USDC",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/D14E72008CFCEA3350A78D784EF8387D8D4A1E91E9E3FBB22A8BE86FAFBC04BE",
      },
      osmosis: {
        assetSymbol: "USDC",
        assetName: "USDC",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/6CE0F4F76F1B5CB3C233BE6167DBD2BB5CF72CF52A30146AE96EF7D29E4FE15C",
      },
    },
  },
  "frax-wei": {
    common_key: {
      devnet: "frax-wei",
      testnet: "frax-wei",
      mainnet: "frax-wei",
    },
    native_chain: "ethereum",
    fully_supported: true,
    decimals: 18,
    chain_aliases: {
      axelar: {
        assetSymbol: "FRAX",
        assetName: "FRAX",
        minDepositAmt: 0.5,
        ibcDenom: "frax-wei",
      },
      moonbeam: {
        assetSymbol: "axlFRAX",
        assetName: "axlFRAX",
        minDepositAmt: 1,
        ibcDenom: "frax-wei",
      },
      fantom: {
        assetSymbol: "axlFRAX",
        assetName: "axlFRAX",
        minDepositAmt: 1,
        ibcDenom: "frax-wei",
      },
      ethereum: {
        assetSymbol: "FRAX",
        assetName: "FRAX",
        minDepositAmt: 20,
        ibcDenom: "frax-wei",
      },
      avalanche: {
        assetSymbol: "axlFRAX",
        assetName: "axlFRAX",
        minDepositAmt: 1,
        ibcDenom: "frax-wei",
      },
      polygon: {
        assetSymbol: "axlFRAX",
        assetName: "axlFRAX",
        minDepositAmt: 1,
        ibcDenom: "frax-wei",
      },
      cosmoshub: {
        assetSymbol: "FRAX",
        assetName: "FRAX",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/260F19355653B57FC201CA718EB831F7D58FE678B845AF19CAB91E2141D78979",
      },
      osmosis: {
        assetSymbol: "FRAX",
        assetName: "FRAX",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/0BB49E2DF79C5379A23B91EFA7A3E78EFF13673A0C8F759C45A8FEE6338A3599",
      },
    },
  },
};

export const allAssets: AssetConfig[] = Object.values(
  environment === "mainnet" ? mainnet : testnet
);
