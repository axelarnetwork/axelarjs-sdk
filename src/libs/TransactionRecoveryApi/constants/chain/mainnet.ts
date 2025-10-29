import { EvmChain } from "../../../../constants/EvmChain";
import { Network } from "@ethersproject/networks";

export const rpcMap: Partial<Record<EvmChain | string, string>> = {
  [EvmChain.FANTOM]: "https://rpc.fantom.network/",
  [EvmChain.POLYGON]: "https://polygon-rpc.com",
  [EvmChain.MOONBEAM]: "https://rpc.api.moonbeam.network",
  [EvmChain.AVALANCHE]: "https://api.avax.network/ext/bc/C/rpc",
  [EvmChain.ETHEREUM]: "https://ethereum.publicnode.com",
  [EvmChain.AURORA]: "https://mainnet.aurora.dev",
  [EvmChain.BINANCE]: "https://bsc-dataseed.binance.org",
  [EvmChain.ARBITRUM]: "https://arb1.arbitrum.io/rpc",
  [EvmChain.CELO]: "https://forno.celo.org",
  [EvmChain.KAVA]: "https://evm.kava.io",
  [EvmChain.FILECOIN]: "https://api.node.glif.io/rpc/v1",
  [EvmChain.OPTIMISM]: "https://mainnet.optimism.io",
  [EvmChain.BASE]: "https://developer-access-mainnet.base.org",
  [EvmChain.LINEA]: "https://rpc.linea.build",
  [EvmChain.POLYGON_ZKEVM]: "https://zkevm-rpc.com",
  [EvmChain.MANTLE]: "https://rpc.mantle.xyz",
  [EvmChain.SCROLL]: "https://rpc.scroll.io",
  [EvmChain.CENTRIFUGE]: "https://fullnode.parachain.centrifuge.io",
  [EvmChain.IMMUTABLE]: "https://rpc.immutable.com",
  [EvmChain.FRAXTAL]: "https://rpc.frax.com",
  [EvmChain.BLAST]: "https://rpc.blast.io",
  [EvmChain.HEDERA]: "https://mainnet.hashio.io/api",
};

export const networkInfo: Partial<Record<EvmChain, Network>> = {
  [EvmChain.FANTOM]: {
    chainId: 250,
    name: EvmChain.FANTOM,
  },
  [EvmChain.BASE]: {
    chainId: 8453,
    name: EvmChain.BASE,
  },
  [EvmChain.FILECOIN]: {
    chainId: 314,
    name: EvmChain.FILECOIN,
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
  [EvmChain.ARBITRUM]: {
    chainId: 42161,
    name: EvmChain.ARBITRUM,
  },
  [EvmChain.CELO]: {
    chainId: 42220,
    name: EvmChain.CELO,
  },
  [EvmChain.KAVA]: {
    chainId: 2222,
    name: EvmChain.KAVA,
  },
  [EvmChain.OPTIMISM]: {
    chainId: 10,
    name: EvmChain.OPTIMISM,
  },
  [EvmChain.LINEA]: {
    chainId: 59144,
    name: EvmChain.LINEA,
  },
  [EvmChain.POLYGON_ZKEVM]: {
    chainId: 1101,
    name: EvmChain.POLYGON_ZKEVM,
  },
  [EvmChain.MANTLE]: {
    chainId: 5000,
    name: EvmChain.MANTLE,
  },
  [EvmChain.SCROLL]: {
    chainId: 534352,
    name: EvmChain.SCROLL,
  },
  [EvmChain.CENTRIFUGE]: {
    chainId: 2031,
    name: EvmChain.CENTRIFUGE,
  },
  [EvmChain.IMMUTABLE]: {
    chainId: 13371,
    name: EvmChain.IMMUTABLE,
  },
  [EvmChain.FRAXTAL]: {
    chainId: 252,
    name: EvmChain.FRAXTAL,
  },
  [EvmChain.BLAST]: {
    chainId: 81457,
    name: EvmChain.BLAST,
  },
  [EvmChain.HEDERA]: {
    chainId: 295,
    name: EvmChain.HEDERA,
  },
};
