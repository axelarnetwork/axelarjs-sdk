import { EvmChain } from "../../../types";
import { Network } from "@ethersproject/networks";

export const rpcMap: Record<EvmChain, string> = {
  [EvmChain.FANTOM]: "https://rpc.testnet.fantom.network",
  [EvmChain.POLYGON]: "https://nd-244-242-844.p2pify.com/a336ed852bfcb6dd53869c8626be64fd",
  [EvmChain.MOONBEAM]: "https://rpc.api.moonbase.moonbeam.network",
  [EvmChain.AVALANCHE]: "https://api.avax-test.network/ext/bc/C/rpc",
  [EvmChain.ETHEREUM]: "https://ropsten.infura.io/v3/510b6d5b3c56497b8070626a54f565a9",
  [EvmChain.AURORA]: "https://testnet.aurora.dev",
  [EvmChain.BINANCE]: "https://data-seed-prebsc-1-s1.binance.org:8545",
};

export const networkInfo: Record<EvmChain, Network> = {
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
  [EvmChain.ETHEREUM]: {
    chainId: 3,
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
};
