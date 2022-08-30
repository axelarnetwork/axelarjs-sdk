import { EvmChain } from "../../../types";
import { Network } from "@ethersproject/networks";

export const rpcMap: Record<EvmChain, string> = {
  [EvmChain.FANTOM]: "https://rpc.ftm.tools",
  [EvmChain.POLYGON]: "https://polygon-rpc.com",
  [EvmChain.MOONBEAM]: "https://rpc.api.moonbeam.network",
  [EvmChain.AVALANCHE]: "https://api.avax.network/ext/bc/C/rpc",
  [EvmChain.ETHEREUM]: "https://mainnet.infura.io/v3/510b6d5b3c56497b8070626a54f565a9",
  [EvmChain.AURORA]: "https://mainnet.aurora.dev",
  [EvmChain.BINANCE]: "https://bsc-dataseed.binance.org",
};

export const networkInfo: Record<EvmChain, Network> = {
  [EvmChain.FANTOM]: {
    chainId: 250,
    name: EvmChain.FANTOM,
  },
  [EvmChain.POLYGON]: {
    chainId: 137,
    name: EvmChain.POLYGON,
  },
  [EvmChain.MOONBEAM]: {
    chainId: 1284,
    name: EvmChain.MOONBEAM,
  },
  [EvmChain.AVALANCHE]: {
    chainId: 43114,
    name: EvmChain.AVALANCHE,
  },
  [EvmChain.ETHEREUM]: {
    chainId: 1,
    name: EvmChain.ETHEREUM,
  },
  [EvmChain.AURORA]: {
    chainId: 1313161554,
    name: EvmChain.AURORA,
  },
  [EvmChain.BINANCE]: {
    chainId: 56,
    name: EvmChain.BINANCE,
  },
};
