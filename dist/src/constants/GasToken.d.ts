import { EvmChain } from "./EvmChain";
export declare enum GasToken {
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
    SCROLL = "ETH",
    IMMUTABLE = "IMX",
    SEPOLIA = "ETH",
    ARBITRUM_SEPOLIA = "ETH",
    CENTRIFUGE = "CFG",
    FRAXTAL = "frxETH",
    BLAST_SEPOLIA = "ETH",
    OPTIMISM_SEPOLIA = "ETH",
    MANTLE_SEPOLIA = "ETH",
    BASE_SEPOLIA = "ETH",
    BLAST = "ETH",
    LINEA_SEPOLIA = "ETH"
}
export declare const nativeGasTokenSymbol: Record<string, Record<EvmChain | string, GasToken>>;
export declare const DEFAULT_ESTIMATED_GAS = 700000;
//# sourceMappingURL=GasToken.d.ts.map