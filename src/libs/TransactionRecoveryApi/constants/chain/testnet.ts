import { EvmChain } from "../../../../constants/EvmChain";
import { Network } from "@ethersproject/networks";

export const rpcMap: Record<EvmChain | string, string> = {
  [EvmChain.FANTOM]: "https://rpc.testnet.fantom.network",
  [EvmChain.POLYGON]: "https://rpc-mumbai.maticvigil.com",
  [EvmChain.MOONBEAM]: "https://rpc.api.moonbase.moonbeam.network",
  [EvmChain.AVALANCHE]: "https://api.avax-test.network/ext/bc/C/rpc",
  [EvmChain.AURORA]: "https://testnet.aurora.dev",
  [EvmChain.BINANCE]: "https://data-seed-prebsc-1-s1.binance.org:8545",
  [EvmChain.BNBCHAIN]: "https://data-seed-prebsc-1-s1.binance.org:8545",
  [EvmChain.CELO]: "https://alfajores-forno.celo-testnet.org",
  [EvmChain.KAVA]: "https://evm.testnet.kava.io",
  "filecoin-2": "https://rpc.ankr.com/filecoin_testnet",
  [EvmChain.POLYGON_ZKEVM]: "https://testnet-zkevm.polygonscan.com",
  [EvmChain.SCROLL]: "https://sepolia-rpc.scroll.io",
  [EvmChain.IMMUTABLE]: "https://rpc.testnet.immutable.com",
  [EvmChain.SEPOLIA]: "https://1rpc.io/sepolia",
  [EvmChain.ARBITRUM_SEPOLIA]: "https://sepolia-rollup.arbitrum.io/rpc",
  [EvmChain.CENTRIFUGE_TESTNET]:
    "https://node-7118620155331796992.gx.onfinality.io/jsonrpc?apikey=00538f2d-6297-44e3-8812-4b9d579524b2",
  [EvmChain.FRAXTAL]: "https://rpc.testnet.frax.com",
  [EvmChain.BLAST_SEPOLIA]: "https://sepolia.blast.io",
  [EvmChain.BASE_SEPOLIA]: "https://sepolia.base.org",
  [EvmChain.OPTIMISM_SEPOLIA]: "https://sepolia.optimism.io",
  [EvmChain.MANTLE_SEPOLIA]: "https://rpc.sepolia.mantle.xyz",
};

export const networkInfo: Record<EvmChain | string, Network> = {
  [EvmChain.FANTOM]: {
    chainId: 4002,
    name: EvmChain.FANTOM,
  },
  [EvmChain.POLYGON]: {
    chainId: 80001,
    name: EvmChain.POLYGON,
  },
  [EvmChain.POLYGON_ZKEVM]: {
    chainId: 1442,
    name: EvmChain.POLYGON_ZKEVM,
  },
  [EvmChain.MOONBEAM]: {
    chainId: 1287,
    name: EvmChain.MOONBEAM,
  },
  [EvmChain.AVALANCHE]: {
    chainId: 43113,
    name: EvmChain.AVALANCHE,
  },
  [EvmChain.AURORA]: {
    chainId: 1313161555,
    name: EvmChain.AURORA,
  },
  [EvmChain.BINANCE]: {
    chainId: 97,
    name: EvmChain.BINANCE,
  },
  [EvmChain.BNBCHAIN]: {
    chainId: 97,
    name: EvmChain.BNBCHAIN,
  },
  [EvmChain.CELO]: {
    chainId: 44787,
    name: EvmChain.CELO,
  },
  [EvmChain.KAVA]: {
    chainId: 2221,
    name: EvmChain.KAVA,
  },
  "filecoin-2": {
    chainId: 314159,
    name: EvmChain.FILECOIN,
  },
  [EvmChain.LINEA]: {
    chainId: 59140,
    name: EvmChain.LINEA,
  },
  [EvmChain.SCROLL]: {
    chainId: 534351,
    name: EvmChain.SCROLL,
  },
  [EvmChain.SEPOLIA]: {
    chainId: 11155111,
    name: EvmChain.SEPOLIA,
  },
  [EvmChain.ARBITRUM_SEPOLIA]: {
    chainId: 421614,
    name: EvmChain.ARBITRUM_SEPOLIA,
  },
  [EvmChain.CENTRIFUGE_TESTNET]: {
    chainId: 2090,
    name: "centrifuge",
  },
  [EvmChain.IMMUTABLE]: {
    chainId: 13473,
    name: EvmChain.IMMUTABLE,
  },
  [EvmChain.FRAXTAL]: {
    chainId: 2522,
    name: EvmChain.FRAXTAL,
  },
  [EvmChain.BASE_SEPOLIA]: {
    chainId: 84532,
    name: EvmChain.BASE_SEPOLIA,
  },
  [EvmChain.BLAST_SEPOLIA]: {
    chainId: 168587773,
    name: EvmChain.BLAST_SEPOLIA,
  },
  [EvmChain.MANTLE_SEPOLIA]: {
    chainId: 5003,
    name: EvmChain.MANTLE_SEPOLIA,
  },
  [EvmChain.OPTIMISM_SEPOLIA]: {
    chainId: 11155420,
    name: EvmChain.OPTIMISM_SEPOLIA,
  },
};
