import { Environment, EvmChain, GasToken } from "../../types";

export const GAS_RECEIVER = {
  [Environment.DEVNET]: {
    [EvmChain.AVALANCHE]: "",
    [EvmChain.MOONBEAM]: "",
    [EvmChain.POLYGON]: "",
    [EvmChain.ETHEREUM]: "",
    [EvmChain.FANTOM]: "",
  },
  [Environment.TESTNET]: {
    [EvmChain.AVALANCHE]: "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
    [EvmChain.MOONBEAM]: "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
    [EvmChain.POLYGON]: "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
    [EvmChain.ETHEREUM]: "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
    [EvmChain.FANTOM]: "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
  },
  [Environment.MAINNET]: {
    [EvmChain.AVALANCHE]: "0xB53C693544363912D2A034f70D9d98808D5E192a",
    [EvmChain.MOONBEAM]: "0x27927CD55db998b720214205e598aA9AD614AEE3",
    [EvmChain.POLYGON]: "0xc8E0b617c388c7E800a7643adDD01218E14a727a",
    [EvmChain.ETHEREUM]: "0x4154CF6eea0633DD9c4933E76a077fD7E9260738",
    [EvmChain.FANTOM]: "0x2879da536D9d107D6b92D95D7c4CFaA5De7088f4",
  },
};

export const NATIVE_GAS_TOKEN_SYMBOL = {
  [EvmChain.AVALANCHE]: GasToken.AVAX,
  [EvmChain.MOONBEAM]: GasToken.GLMR,
  [EvmChain.POLYGON]: GasToken.MATIC,
  [EvmChain.ETHEREUM]: GasToken.ETH,
  [EvmChain.FANTOM]: GasToken.FTM,
};

export const DEFAULT_ESTIMATED_GAS = 700000;
