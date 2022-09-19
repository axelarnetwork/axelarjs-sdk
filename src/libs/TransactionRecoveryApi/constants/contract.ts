import { EvmChain, GasToken } from "../../types";

export const NATIVE_GAS_TOKEN_SYMBOL = {
  [EvmChain.AVALANCHE]: GasToken.AVAX,
  [EvmChain.MOONBEAM]: GasToken.GLMR,
  [EvmChain.POLYGON]: GasToken.MATIC,
  [EvmChain.ETHEREUM]: GasToken.ETH,
  [EvmChain.FANTOM]: GasToken.FTM,
  [EvmChain.AURORA]: GasToken.AURORA,
  [EvmChain.BINANCE]: GasToken.BINANCE,
};

export const DEFAULT_ESTIMATED_GAS = 700000;
