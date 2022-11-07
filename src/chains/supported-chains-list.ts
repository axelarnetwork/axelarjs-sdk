import { Environment } from "../libs";

export const CHAINS = {
  TESTNET: {
    AURA: "aura",
    AXELAR: "axelarnet",
    COMDEX: "comdex",
    EVMOS: "evmos",
    FETCH: "fetch",
    KUJIRA: "kujira",
    OSMOSIS: "osmosis-4",
    SEI: "sei",
    AURORA: "aurora",
    AVALANCHE: "Avalanche",
    BINANCE: "binance",
    ETHEREUM: "ethereum-2",
    FANTOM: "Fantom",
    MOONBEAM: "Moonbeam",
    POLYGON: "Polygon",
    TERRA: "terra-3",
  },
  MAINNET: {
    ASSETMANTLE: "assetmantle",
    AVALANCHE: "Avalanche",
    AXELAR: "axelarnet",
    BINANCE: "binance",
    COMDEX: "comdex",
    COSMOSHUB: "cosmoshub",
    CRESCENT: "crescent",
    ETHEREUM: "Ethereum",
    EVMOS: "evmos",
    FANTOM: "Fantom",
    FETCH: "fetch",
    INJECTIVE: "injective",
    JUNO: "juno",
    KI: "ki",
    KUJIRA: "kujira",
    MOONBEAM: "Moonbeam",
    OSMOSIS: "osmosis",
    POLYGON: "Polygon",
    REGEN: "regen",
    SECRET: "secret",
    STARGAZE: "stargaze",
    TERRA: "terra-2",
    EMONEY: "e-money",
    AGORIC: "agoric",
    UMEEE: "umee",
  },
};

export const getChainIdsForEnvironment = (env: Environment) => {
  if (![Environment.TESTNET, Environment.MAINNET].includes(env)) throw "environment must be TESTNET or MAINNET";

  return CHAINS[(env as string).toUpperCase() as "TESTNET" | "MAINNET"];
}