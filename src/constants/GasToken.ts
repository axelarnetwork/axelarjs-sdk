import { EvmChain } from "./EvmChain";

// Includes all supported native tokens and stablecoins (i.e. for fees)

export enum GasToken {
  ETH = "ETH",
  AVAX = "AVAX",
  GLMR = "GLMR",
  FTM = "FTM",
  MATIC = "MATIC",
  USDC = "USDC",
  aUSDC = "aUSDC",
  axlUSDC = "axlUSDC",
  AURORA = "aETH",
  BINANCE = "BNB",
  BNBCHAIN = "BNB",
  CELO = "CELO",
  KAVA = "KAVA",
  BASE = "ETH",
  FILECOIN = "FIL",
  OSMO = "OSMO",
  AXL = "AXL",
  POLYGON_ZKEVM = "ETH",
  MANTLE = "MNT",
}

export const nativeGasTokenSymbol: Record<string, Record<EvmChain | string, GasToken>> = {
  testnet: {
    [EvmChain.AVALANCHE]: GasToken.AVAX,
    [EvmChain.MOONBEAM]: GasToken.GLMR,
    [EvmChain.POLYGON]: GasToken.MATIC,
    "ethereum-2": GasToken.ETH,
    [EvmChain.FANTOM]: GasToken.FTM,
    [EvmChain.AURORA]: GasToken.AURORA,
    [EvmChain.BINANCE]: GasToken.BINANCE,
    [EvmChain.BNBCHAIN]: GasToken.BNBCHAIN,
    [EvmChain.ARBITRUM]: GasToken.ETH,
    [EvmChain.CELO]: GasToken.CELO,
    [EvmChain.KAVA]: GasToken.KAVA,
    [EvmChain.BASE]: GasToken.BASE,
    "filecoin-2": GasToken.FILECOIN,
    [EvmChain.OPTIMISM]: GasToken.ETH,
    [EvmChain.LINEA]: GasToken.ETH,
    [EvmChain.POLYGON_ZKEVM]: GasToken.POLYGON_ZKEVM,
    [EvmChain.MANTLE]: GasToken.MANTLE,
  },
  mainnet: {
    [EvmChain.AVALANCHE]: GasToken.AVAX,
    [EvmChain.MOONBEAM]: GasToken.GLMR,
    [EvmChain.POLYGON]: GasToken.MATIC,
    [EvmChain.ETHEREUM]: GasToken.ETH,
    [EvmChain.FANTOM]: GasToken.FTM,
    [EvmChain.AURORA]: GasToken.AURORA,
    [EvmChain.BINANCE]: GasToken.BINANCE,
    [EvmChain.BNBCHAIN]: GasToken.BNBCHAIN,
    [EvmChain.ARBITRUM]: GasToken.ETH,
    [EvmChain.CELO]: GasToken.CELO,
    [EvmChain.KAVA]: GasToken.KAVA,
    [EvmChain.BASE]: GasToken.BASE,
    [EvmChain.FILECOIN]: GasToken.FILECOIN,
    [EvmChain.OPTIMISM]: GasToken.ETH,
    [EvmChain.LINEA]: GasToken.ETH,
    [EvmChain.POLYGON_ZKEVM]: GasToken.POLYGON_ZKEVM,
    [EvmChain.MANTLE]: GasToken.MANTLE,
  },
};

export const DEFAULT_ESTIMATED_GAS = 700000;
