import { EvmChain } from "../../../types";
import { Network } from "@ethersproject/networks";

export const rpcMap: Record<EvmChain | string, string> = {
  [EvmChain.FANTOM]: "https://rpc.testnet.fantom.network",
  [EvmChain.POLYGON]: "https://nd-244-242-844.p2pify.com/a336ed852bfcb6dd53869c8626be64fd",
  [EvmChain.MOONBEAM]: "https://rpc.api.moonbase.moonbeam.network",
  [EvmChain.AVALANCHE]: "https://api.avax-test.network/ext/bc/C/rpc",
  "ethereum-2": "https://goerli.infura.io/v3/510b6d5b3c56497b8070626a54f565a9",
  [EvmChain.AURORA]: "https://testnet.aurora.dev",
  [EvmChain.BINANCE]: "https://data-seed-prebsc-1-s1.binance.org:8545",
  [EvmChain.BNBCHAIN]: "https://data-seed-prebsc-1-s1.binance.org:8545",
  [EvmChain.ARBITRUM]: "https://goerli-rollup.arbitrum.io/rpc",
  [EvmChain.CELO]: "https://alfajores-forno.celo-testnet.org",
  [EvmChain.KAVA]: "https://evm.testnet.kava.io",
  [EvmChain.BASE]: "https://goerli.base.org",
  [EvmChain.FILECOIN]: "https://rpc.ankr.com/filecoin_testnet",
  [EvmChain.OPTIMISM]: "https://goerli.optimism.io",
  [EvmChain.LINEA]: "https://rpc.goerli.linea.build",
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
  [EvmChain.MOONBEAM]: {
    chainId: 1287,
    name: EvmChain.MOONBEAM,
  },
  [EvmChain.AVALANCHE]: {
    chainId: 43113,
    name: EvmChain.AVALANCHE,
  },
  "ethereum-2": {
    chainId: 5,
    name: EvmChain.ETHEREUM,
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
  [EvmChain.ARBITRUM]: {
    chainId: 421613,
    name: `${EvmChain.ARBITRUM}-goerli`,
  },
  [EvmChain.CELO]: {
    chainId: 44787,
    name: EvmChain.CELO,
  },
  [EvmChain.KAVA]: {
    chainId: 2221,
    name: EvmChain.KAVA,
  },
  [EvmChain.BASE]: {
    chainId: 84_531,
    name: EvmChain.BASE,
  },
  [EvmChain.FILECOIN]: {
    chainId: 3141,
    name: EvmChain.FILECOIN,
  },
  [EvmChain.OPTIMISM]: {
    chainId: 420,
    name: `${EvmChain.OPTIMISM}-goerli`,
  },
  [EvmChain.LINEA]: {
    chainId: 59140,
    name: EvmChain.LINEA,
  },
};
