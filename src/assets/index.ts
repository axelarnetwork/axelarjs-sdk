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
        fullDenomPath: "uaxl",
      },
      moonbeam: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uaxl",
        fullDenomPath: "uaxl",
      },
      fantom: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uaxl",
        fullDenomPath: "uaxl",
      },
      ethereum: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uaxl",
        fullDenomPath: "uaxl",
      },
      avalanche: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uaxl",
        fullDenomPath: "uaxl",
      },
      polygon: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uaxl",
        fullDenomPath: "uaxl",
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
      axelar: {
        assetSymbol: "UST",
        assetName: "UST",
        minDepositAmt: 0.05,
        ibcDenom:
          "ibc/6F4968A73F90CF7DE6394BF937D6DF7C7D162D74D839C13F53B41157D315E05F",
        fullDenomPath: "transfer/channel-0/uusd",
      },
      moonbeam: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      fantom: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      ethereum: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      avalanche: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      polygon: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      terra: {
        assetSymbol: "UST",
        assetName: "UST",
        minDepositAmt: 0.05,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
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
        minDepositAmt: 0.0006,
        ibcDenom:
          "ibc/4627AD2524E3E0523047E35BB76CC90E37D9D57ACF14F0FCBCEB2480705F3CB8",
        fullDenomPath: "transfer/channel-0/uluna",
      },
      moonbeam: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      fantom: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      ethereum: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      avalanche: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      polygon: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      terra: {
        assetSymbol: "LUNA",
        assetName: "LUNA",
        minDepositAmt: 0.0006,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
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
        fullDenomPath: "wmatic-wei",
      },
      moonbeam: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC (Axelar-wrapped)",
        minDepositAmt: 0.07,
        ibcDenom: "wmatic-wei",
        fullDenomPath: "wmatic-wei",
      },
      fantom: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC (Axelar-wrapped)",
        minDepositAmt: 0.07,
        ibcDenom: "wmatic-wei",
        fullDenomPath: "wmatic-wei",
      },
      ethereum: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC (Axelar-wrapped)",
        minDepositAmt: 0.07,
        ibcDenom: "wmatic-wei",
        fullDenomPath: "wmatic-wei",
      },
      avalanche: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC (Axelar-wrapped)",
        minDepositAmt: 0.07,
        ibcDenom: "wmatic-wei",
        fullDenomPath: "wmatic-wei",
      },
      polygon: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.07,
        ibcDenom: "wmatic-wei",
        fullDenomPath: "wmatic-wei",
      },
      cosmoshub: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.03,
        ibcDenom:
          "ibc/1BE5BF73F50D2D82C74628C6290834E66C5467F231B7FBC7DD45E217EE1D42A5",
        fullDenomPath: "transfer/channel-238/wmatic-wei",
      },
      osmosis: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.03,
        ibcDenom:
          "ibc/67D0DAF8D504ED1616A1886CCECB4E366DC81A8EF48BD22AEA1F44BE87ED19AE",
        fullDenomPath: "transfer/channel-184/wmatic-wei",
      },
      terra: {
        assetSymbol: "WMATIC",
        assetName: "WMATIC",
        minDepositAmt: 0.03,
        ibcDenom:
          "ibc/90CC92BD6683D3D39933223D50FB678B6C2EDC4F4B048E21BF358570B2087916",
        fullDenomPath: "transfer/channel-78/wmatic-wei",
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
        fullDenomPath: "wftm-wei",
      },
      moonbeam: {
        assetSymbol: "WFTM",
        assetName: "WFTM (Axelar-wrapped)",
        minDepositAmt: 0.08,
        ibcDenom: "wftm-wei",
        fullDenomPath: "wftm-wei",
      },
      fantom: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.08,
        ibcDenom: "wftm-wei",
        fullDenomPath: "wftm-wei",
      },
      ethereum: {
        assetSymbol: "WFTM",
        assetName: "WFTM (Axelar-wrapped)",
        minDepositAmt: 0.08,
        ibcDenom: "wftm-wei",
        fullDenomPath: "wftm-wei",
      },
      avalanche: {
        assetSymbol: "WFTM",
        assetName: "WFTM (Axelar-wrapped)",
        minDepositAmt: 0.08,
        ibcDenom: "wftm-wei",
        fullDenomPath: "wftm-wei",
      },
      polygon: {
        assetSymbol: "WFTM",
        assetName: "WFTM (Axelar-wrapped)",
        minDepositAmt: 0.08,
        ibcDenom: "wftm-wei",
        fullDenomPath: "wftm-wei",
      },
      cosmoshub: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.04,
        ibcDenom:
          "ibc/947B84E653CBEC9386287883173A40D3C0A284AB554557342C50378219ECE147",
        fullDenomPath: "transfer/channel-238/wftm-wei",
      },
      osmosis: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.04,
        ibcDenom:
          "ibc/033C5FCE2C549920B75CC794D12BC3407F638421C982CE9B48D4E5D986F4EFCE",
        fullDenomPath: "transfer/channel-184/wftm-wei",
      },
      terra: {
        assetSymbol: "WFTM",
        assetName: "WFTM",
        minDepositAmt: 0.04,
        ibcDenom:
          "ibc/95482BCD668E74C030E1B8CE0874A447A593C144C8E9DB41BE05B7A9495ECDD7",
        fullDenomPath: "transfer/channel-78/wftm-wei",
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
        fullDenomPath: "weth-wei",
      },
      moonbeam: {
        assetSymbol: "WETH",
        assetName: "WETH (Axelar-wrapped)",
        minDepositAmt: 0.00004,
        ibcDenom: "weth-wei",
        fullDenomPath: "weth-wei",
      },
      fantom: {
        assetSymbol: "WETH",
        assetName: "WETH (Axelar-wrapped)",
        minDepositAmt: 0.00004,
        ibcDenom: "weth-wei",
        fullDenomPath: "weth-wei",
      },
      ethereum: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00004,
        ibcDenom: "weth-wei",
        fullDenomPath: "weth-wei",
      },
      avalanche: {
        assetSymbol: "WETH",
        assetName: "WETH (Axelar-wrapped)",
        minDepositAmt: 0.00004,
        ibcDenom: "weth-wei",
        fullDenomPath: "weth-wei",
      },
      polygon: {
        assetSymbol: "WETH",
        assetName: "WETH (Axelar-wrapped)",
        minDepositAmt: 0.00004,
        ibcDenom: "weth-wei",
        fullDenomPath: "weth-wei",
      },
      cosmoshub: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00002,
        ibcDenom:
          "ibc/DEC3B614DEA87E77AFABE3EDA1F95A7E1A429080950AD9B0AF257FE01706CA0B",
        fullDenomPath: "transfer/channel-238/weth-wei",
      },
      osmosis: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00002,
        ibcDenom:
          "ibc/A8C7A5D5767DECBAF96AFDE4C2D99D95BE9FF38CA75BE3A1CD31E3D20264EFF9",
        fullDenomPath: "transfer/channel-184/weth-wei",
      },
      terra: {
        assetSymbol: "WETH",
        assetName: "WETH",
        minDepositAmt: 0.00002,
        ibcDenom:
          "ibc/E614301CF4F54C23FAEEBF50F33D247AC743E9F247AB094AC57F68DB3A80635C",
        fullDenomPath: "transfer/channel-78/weth-wei",
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
        fullDenomPath: "wavax-wei",
      },
      moonbeam: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "wavax-wei",
        fullDenomPath: "wavax-wei",
      },
      fantom: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "wavax-wei",
        fullDenomPath: "wavax-wei",
      },
      ethereum: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "wavax-wei",
        fullDenomPath: "wavax-wei",
      },
      avalanche: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.001,
        ibcDenom: "wavax-wei",
        fullDenomPath: "wavax-wei",
      },
      polygon: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "wavax-wei",
        fullDenomPath: "wavax-wei",
      },
      cosmoshub: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.0007,
        ibcDenom:
          "ibc/88C2DE3AE63A443385CDFE54A18B0FC48402DDF3FE5AC532A663F9C3A1144462",
        fullDenomPath: "transfer/channel-238/wavax-wei",
      },
      osmosis: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.0007,
        ibcDenom:
          "ibc/9534907D2838E2134F21CC286A4CD0FF3CA96AA032F9F695ABF5621CC98AB17F",
        fullDenomPath: "transfer/channel-184/wavax-wei",
      },
      terra: {
        assetSymbol: "WAVAX",
        assetName: "WAVAX",
        minDepositAmt: 0.0007,
        ibcDenom:
          "ibc/0D2A39F3DF653685ED16DED245C83A51B9DD6CB8A55DE2C39D194BE44C108765",
        fullDenomPath: "transfer/channel-78/wavax-wei",
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
        fullDenomPath: "wdev-wei",
      },
      moonbeam: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.04,
        ibcDenom: "wdev-wei",
        fullDenomPath: "wdev-wei",
      },
      fantom: {
        assetSymbol: "WDEV",
        assetName: "WDEV (Axelar-wrapped)",
        minDepositAmt: 0.04,
        ibcDenom: "wdev-wei",
        fullDenomPath: "wdev-wei",
      },
      ethereum: {
        assetSymbol: "WDEV",
        assetName: "WDEV (Axelar-wrapped)",
        minDepositAmt: 0.04,
        ibcDenom: "wdev-wei",
        fullDenomPath: "wdev-wei",
      },
      avalanche: {
        assetSymbol: "WDEV",
        assetName: "WDEV (Axelar-wrapped)",
        minDepositAmt: 0.04,
        ibcDenom: "wdev-wei",
        fullDenomPath: "wdev-wei",
      },
      polygon: {
        assetSymbol: "WDEV",
        assetName: "WDEV (Axelar-wrapped)",
        minDepositAmt: 0.04,
        ibcDenom: "wdev-wei",
        fullDenomPath: "wdev-wei",
      },
      cosmoshub: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.02,
        ibcDenom:
          "ibc/12B944E03F3E2197589129CB359E1BD5FA3F06841792FFE46852EAFE31EEB20A",
        fullDenomPath: "transfer/channel-238/wdev-wei",
      },
      osmosis: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.02,
        ibcDenom:
          "ibc/D3AF2C7986FA1191157529F68609887103EBBD0B9CAFAD615CF19B419E2F5566",
        fullDenomPath: "transfer/channel-184/wdev-wei",
      },
      terra: {
        assetSymbol: "WDEV",
        assetName: "WDEV",
        minDepositAmt: 0.02,
        ibcDenom:
          "ibc/2A3208A0A402373F2E3E43228FC51F298433CE1BA5EDBF246ACE5F2E5111448E",
        fullDenomPath: "transfer/channel-78/wdev-wei",
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
        minDepositAmt: 0.002,
        ibcDenom:
          "ibc/EF48E6B1A1A19F47ECAEA62F5670C37C0580E86A9E88498B7E393EB6F49F33C0",
        fullDenomPath: "transfer/channel-4/uatom",
      },
      moonbeam: {
        assetSymbol: "ATOM",
        assetName: "ATOM (Axelar-wrapped)",
        minDepositAmt: 0.004,
        ibcDenom: "uatom",
        fullDenomPath: "uatom",
      },
      fantom: {
        assetSymbol: "ATOM",
        assetName: "ATOM (Axelar-wrapped)",
        minDepositAmt: 0.004,
        ibcDenom: "uatom",
        fullDenomPath: "uatom",
      },
      ethereum: {
        assetSymbol: "ATOM",
        assetName: "ATOM (Axelar-wrapped)",
        minDepositAmt: 0.004,
        ibcDenom: "uatom",
        fullDenomPath: "uatom",
      },
      avalanche: {
        assetSymbol: "ATOM",
        assetName: "ATOM (Axelar-wrapped)",
        minDepositAmt: 0.004,
        ibcDenom: "uatom",
        fullDenomPath: "uatom",
      },
      polygon: {
        assetSymbol: "ATOM",
        assetName: "ATOM (Axelar-wrapped)",
        minDepositAmt: 0.004,
        ibcDenom: "uatom",
        fullDenomPath: "uatom",
      },
      cosmoshub: {
        assetSymbol: "ATOM",
        assetName: "ATOM",
        minDepositAmt: 0.002,
        ibcDenom: "uatom",
        fullDenomPath: "uatom",
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
        fullDenomPath: "uausdc",
      },
      moonbeam: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uausdc",
        fullDenomPath: "uausdc",
      },
      fantom: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uausdc",
        fullDenomPath: "uausdc",
      },
      ethereum: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC",
        minDepositAmt: 0.1,
        ibcDenom: "uausdc",
        fullDenomPath: "uausdc",
      },
      avalanche: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uausdc",
        fullDenomPath: "uausdc",
      },
      polygon: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uausdc",
        fullDenomPath: "uausdc",
      },
      cosmoshub: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC",
        minDepositAmt: 0.05,
        ibcDenom:
          "ibc/3DC20E9A12C8F19A92CDEBC37116C26EADF4C65E7498193791A3DAAD0B263556",
        fullDenomPath: "transfer/channel-238/uausdc",
      },
      osmosis: {
        assetSymbol: "aUSDC",
        assetName: "aUSDC",
        minDepositAmt: 0.05,
        ibcDenom:
          "ibc/423FB88C7D1D4FCA2F7E67F07473DB4BB14282AE6F7B1A41B220A1AD9A762254",
        fullDenomPath: "transfer/channel-184/uausdc",
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
        fullDenomPath: "transfer/channel-0/uusd",
      },
      moonbeam: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 1,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      fantom: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 1,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      ethereum: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 20,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      avalanche: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 1,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      polygon: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 1,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      terra: {
        assetSymbol: "UST",
        assetName: "UST",
        minDepositAmt: 0.5,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
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
        fullDenomPath: "transfer/channel-0/uluna",
      },
      moonbeam: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.01,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      fantom: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.01,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      ethereum: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.2,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      avalanche: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.01,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      polygon: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.01,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      terra: {
        assetSymbol: "LUNA",
        assetName: "LUNA",
        minDepositAmt: 0.005,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
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
        fullDenomPath: "transfer/channel-2/uatom",
      },
      moonbeam: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.04,
        ibcDenom: "uatom",
        fullDenomPath: "uatom",
      },
      fantom: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.04,
        ibcDenom: "uatom",
        fullDenomPath: "uatom",
      },
      ethereum: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.7,
        ibcDenom: "uatom",
        fullDenomPath: "uatom",
      },
      avalanche: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.04,
        ibcDenom: "uatom",
        fullDenomPath: "uatom",
      },
      polygon: {
        assetSymbol: "axlATOM",
        assetName: "axlATOM",
        minDepositAmt: 0.04,
        ibcDenom: "uatom",
        fullDenomPath: "uatom",
      },
      cosmoshub: {
        assetSymbol: "ATOM",
        assetName: "ATOM",
        minDepositAmt: 0.02,
        ibcDenom: "uatom",
        fullDenomPath: "uatom",
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
        fullDenomPath: "uusdc",
      },
      moonbeam: {
        assetSymbol: "axlUSDC",
        assetName: "axlUSDC",
        minDepositAmt: 1,
        ibcDenom: "uusdc",
        fullDenomPath: "uusdc",
      },
      fantom: {
        assetSymbol: "axlUSDC",
        assetName: "axlUSDC",
        minDepositAmt: 1,
        ibcDenom: "uusdc",
        fullDenomPath: "uusdc",
      },
      ethereum: {
        assetSymbol: "USDC",
        assetName: "USDC",
        minDepositAmt: 20,
        ibcDenom: "uusdc",
        fullDenomPath: "uusdc",
      },
      avalanche: {
        assetSymbol: "axlUSDC",
        assetName: "axlUSDC",
        minDepositAmt: 1,
        ibcDenom: "uusdc",
        fullDenomPath: "uusdc",
      },
      polygon: {
        assetSymbol: "axlUSDC",
        assetName: "axlUSDC",
        minDepositAmt: 1,
        ibcDenom: "uusdc",
        fullDenomPath: "uusdc",
      },
      cosmoshub: {
        assetSymbol: "USDC",
        assetName: "USDC",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/932D6003DA334ECBC5B23A071B4287D0A5CC97331197FE9F1C0689BA002A8421",
        fullDenomPath: "transfer/channel-293/uusdc",
      },
      osmosis: {
        assetSymbol: "USDC",
        assetName: "USDC",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        fullDenomPath: "transfer/channel-208/uusdc",
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
        fullDenomPath: "frax-wei",
      },
      moonbeam: {
        assetSymbol: "axlFRAX",
        assetName: "axlFRAX",
        minDepositAmt: 1,
        ibcDenom: "frax-wei",
        fullDenomPath: "frax-wei",
      },
      fantom: {
        assetSymbol: "axlFRAX",
        assetName: "axlFRAX",
        minDepositAmt: 1,
        ibcDenom: "frax-wei",
        fullDenomPath: "frax-wei",
      },
      ethereum: {
        assetSymbol: "FRAX",
        assetName: "FRAX",
        minDepositAmt: 20,
        ibcDenom: "frax-wei",
        fullDenomPath: "frax-wei",
      },
      avalanche: {
        assetSymbol: "axlFRAX",
        assetName: "axlFRAX",
        minDepositAmt: 1,
        ibcDenom: "frax-wei",
        fullDenomPath: "frax-wei",
      },
      polygon: {
        assetSymbol: "axlFRAX",
        assetName: "axlFRAX",
        minDepositAmt: 1,
        ibcDenom: "frax-wei",
        fullDenomPath: "frax-wei",
      },
      cosmoshub: {
        assetSymbol: "FRAX",
        assetName: "FRAX",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/3792246C7C422C037C603C955F8383B4E32E7555D693344F9A029A67FE221C57",
        fullDenomPath: "transfer/channel-293/frax-wei",
      },
      osmosis: {
        assetSymbol: "FRAX",
        assetName: "FRAX",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/0E43EDE2E2A3AFA36D0CD38BDDC0B49FECA64FA426A82E102F304E430ECF46EE",
        fullDenomPath: "transfer/channel-208/frax-wei",
      },
    },
  },
  "dai-wei": {
    common_key: {
      devnet: "dai-wei",
      testnet: "dai-wei",
      mainnet: "dai-wei",
    },
    native_chain: "ethereum",
    fully_supported: true,
    decimals: 18,
    chain_aliases: {
      axelar: {
        assetSymbol: "DAI",
        assetName: "DAI",
        minDepositAmt: 0.5,
        ibcDenom: "dai-wei",
        fullDenomPath: "dai-wei",
      },
      moonbeam: {
        assetSymbol: "axlDAI",
        assetName: "axlDAI",
        minDepositAmt: 1,
        ibcDenom: "dai-wei",
        fullDenomPath: "dai-wei",
      },
      fantom: {
        assetSymbol: "axlDAI",
        assetName: "axlDAI",
        minDepositAmt: 1,
        ibcDenom: "dai-wei",
        fullDenomPath: "dai-wei",
      },
      ethereum: {
        assetSymbol: "DAI",
        assetName: "DAI",
        minDepositAmt: 20,
        ibcDenom: "dai-wei",
        fullDenomPath: "dai-wei",
      },
      avalanche: {
        assetSymbol: "axlDAI",
        assetName: "axlDAI",
        minDepositAmt: 1,
        ibcDenom: "dai-wei",
        fullDenomPath: "dai-wei",
      },
      polygon: {
        assetSymbol: "axlDAI",
        assetName: "axlDAI",
        minDepositAmt: 1,
        ibcDenom: "dai-wei",
        fullDenomPath: "dai-wei",
      },
      cosmoshub: {
        assetSymbol: "DAI",
        assetName: "DAI",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/4A98C8AC2C35498162346F28EEBF3206CBEF81F44725FE62A3DB0CC10E88E695",
        fullDenomPath: "transfer/channel-293/dai-wei",
      },
      osmosis: {
        assetSymbol: "DAI",
        assetName: "DAI",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        fullDenomPath: "transfer/channel-208/dai-wei",
      },
    },
  },
  uusdt: {
    common_key: {
      devnet: "uusdt",
      testnet: "uusdt",
      mainnet: "uusdt",
    },
    native_chain: "ethereum",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      axelar: {
        assetSymbol: "USDT",
        assetName: "USDT",
        minDepositAmt: 0.5,
        ibcDenom: "uusdt",
        fullDenomPath: "uusdt",
      },
      moonbeam: {
        assetSymbol: "axlUSDT",
        assetName: "axlUSDT",
        minDepositAmt: 1,
        ibcDenom: "uusdt",
        fullDenomPath: "uusdt",
      },
      fantom: {
        assetSymbol: "axlUSDT",
        assetName: "axlUSDT",
        minDepositAmt: 1,
        ibcDenom: "uusdt",
        fullDenomPath: "uusdt",
      },
      ethereum: {
        assetSymbol: "USDT",
        assetName: "USDT",
        minDepositAmt: 20,
        ibcDenom: "uusdt",
        fullDenomPath: "uusdt",
      },
      avalanche: {
        assetSymbol: "axlUSDT",
        assetName: "axlUSDT",
        minDepositAmt: 1,
        ibcDenom: "uusdt",
        fullDenomPath: "uusdt",
      },
      polygon: {
        assetSymbol: "axlUSDT",
        assetName: "axlUSDT",
        minDepositAmt: 1,
        ibcDenom: "uusdt",
        fullDenomPath: "uusdt",
      },
      cosmoshub: {
        assetSymbol: "USDT",
        assetName: "USDT",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/5662412372381F56C5F83A0404DC7209E5143ABD32EF67B5705DBE8D9C2BF001",
        fullDenomPath: "transfer/channel-293/uusdt",
      },
      osmosis: {
        assetSymbol: "USDT",
        assetName: "USDT",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
        fullDenomPath: "transfer/channel-208/uusdt",
      },
    },
  },
  ungm: {
    common_key: {
      devnet: "ungm",
      testnet: "ungm",
      mainnet: "ungm",
    },
    native_chain: "e-money",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      axelar: {
        assetSymbol: "NGM",
        assetName: "NGM",
        minDepositAmt: 0.4,
        ibcDenom:
          "ibc/ACD9A665DB6C19EC1D057A43D468E324CA9FB9C5ABF82235815F7B7745A15B80",
        fullDenomPath: "transfer/channel-6/ungm",
      },
      moonbeam: {
        assetSymbol: "NGM",
        assetName: "NGM",
        minDepositAmt: 0.8,
        ibcDenom: "ungm",
        fullDenomPath: "ungm",
      },
      fantom: {
        assetSymbol: "NGM",
        assetName: "NGM",
        minDepositAmt: 0.8,
        ibcDenom: "ungm",
        fullDenomPath: "ungm",
      },
      ethereum: {
        assetSymbol: "NGM",
        assetName: "NGM",
        minDepositAmt: 20,
        ibcDenom: "ungm",
        fullDenomPath: "ungm",
      },
      avalanche: {
        assetSymbol: "NGM",
        assetName: "NGM",
        minDepositAmt: 0.8,
        ibcDenom: "ungm",
        fullDenomPath: "ungm",
      },
      polygon: {
        assetSymbol: "NGM",
        assetName: "NGM",
        minDepositAmt: 0.8,
        ibcDenom: "ungm",
        fullDenomPath: "ungm",
      },
      "e-money": {
        assetSymbol: "NGM",
        assetName: "NGM",
        minDepositAmt: 0.4,
        ibcDenom: "ungm",
        fullDenomPath: "ungm",
      },
    },
  },
  eeur: {
    common_key: {
      devnet: "eeur",
      testnet: "eeur",
      mainnet: "eeur",
    },
    native_chain: "e-money",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      axelar: {
        assetSymbol: "EEUR",
        assetName: "EEUR",
        minDepositAmt: 0.5,
        ibcDenom:
          "ibc/373EF14936B38AC8F8A7E7024C0FB7099369FDDFDA3CDA9EFA73684B16249B64",
        fullDenomPath: "transfer/channel-6/eeur",
      },
      moonbeam: {
        assetSymbol: "EEUR",
        assetName: "EEUR",
        minDepositAmt: 1,
        ibcDenom: "eeur",
        fullDenomPath: "eeur",
      },
      fantom: {
        assetSymbol: "EEUR",
        assetName: "EEUR",
        minDepositAmt: 1,
        ibcDenom: "eeur",
        fullDenomPath: "eeur",
      },
      ethereum: {
        assetSymbol: "EEUR",
        assetName: "EEUR",
        minDepositAmt: 20,
        ibcDenom: "eeur",
        fullDenomPath: "eeur",
      },
      avalanche: {
        assetSymbol: "EEUR",
        assetName: "EEUR",
        minDepositAmt: 1,
        ibcDenom: "eeur",
        fullDenomPath: "eeur",
      },
      polygon: {
        assetSymbol: "EEUR",
        assetName: "EEUR",
        minDepositAmt: 1,
        ibcDenom: "eeur",
        fullDenomPath: "eeur",
      },
      "e-money": {
        assetSymbol: "EEUR",
        assetName: "EEUR",
        minDepositAmt: 0.5,
        ibcDenom: "eeur",
        fullDenomPath: "eeur",
      },
    },
  },
};

export const allAssets: AssetConfig[] = Object.values(
  environment === "mainnet" ? mainnet : testnet
);
