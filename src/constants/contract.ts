import { EvmChain } from "./EvmChain";
import { GasToken } from "./GasToken";

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
