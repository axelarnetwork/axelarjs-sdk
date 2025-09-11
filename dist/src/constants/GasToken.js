"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ESTIMATED_GAS = exports.nativeGasTokenSymbol = exports.GasToken = void 0;
const EvmChain_1 = require("./EvmChain");
// Includes all supported native tokens and stablecoins (i.e. for fees)
var GasToken;
(function (GasToken) {
    GasToken["ETH"] = "ETH";
    GasToken["AVAX"] = "AVAX";
    GasToken["GLMR"] = "GLMR";
    GasToken["FTM"] = "FTM";
    GasToken["MATIC"] = "MATIC";
    GasToken["USDC"] = "USDC";
    GasToken["aUSDC"] = "aUSDC";
    GasToken["axlUSDC"] = "axlUSDC";
    GasToken["AURORA"] = "aETH";
    GasToken["BINANCE"] = "BNB";
    GasToken["BNBCHAIN"] = "BNB";
    GasToken["CELO"] = "CELO";
    GasToken["KAVA"] = "KAVA";
    GasToken["BASE"] = "ETH";
    GasToken["FILECOIN"] = "FIL";
    GasToken["OSMO"] = "OSMO";
    GasToken["AXL"] = "AXL";
    GasToken["POLYGON_ZKEVM"] = "ETH";
    GasToken["MANTLE"] = "MNT";
    GasToken["SCROLL"] = "ETH";
    GasToken["IMMUTABLE"] = "IMX";
    GasToken["SEPOLIA"] = "ETH";
    GasToken["ARBITRUM_SEPOLIA"] = "ETH";
    GasToken["CENTRIFUGE"] = "CFG";
    GasToken["FRAXTAL"] = "frxETH";
    GasToken["BLAST_SEPOLIA"] = "ETH";
    GasToken["OPTIMISM_SEPOLIA"] = "ETH";
    GasToken["MANTLE_SEPOLIA"] = "ETH";
    GasToken["BASE_SEPOLIA"] = "ETH";
    GasToken["BLAST"] = "ETH";
    GasToken["LINEA_SEPOLIA"] = "ETH";
})(GasToken || (exports.GasToken = GasToken = {}));
exports.nativeGasTokenSymbol = {
    testnet: {
        [EvmChain_1.EvmChain.AVALANCHE]: GasToken.AVAX,
        [EvmChain_1.EvmChain.MOONBEAM]: GasToken.GLMR,
        [EvmChain_1.EvmChain.POLYGON]: GasToken.MATIC,
        "ethereum-2": GasToken.ETH,
        [EvmChain_1.EvmChain.FANTOM]: GasToken.FTM,
        [EvmChain_1.EvmChain.AURORA]: GasToken.AURORA,
        [EvmChain_1.EvmChain.BINANCE]: GasToken.BINANCE,
        [EvmChain_1.EvmChain.ARBITRUM]: GasToken.ETH,
        [EvmChain_1.EvmChain.CELO]: GasToken.CELO,
        [EvmChain_1.EvmChain.KAVA]: GasToken.KAVA,
        [EvmChain_1.EvmChain.BASE]: GasToken.BASE,
        "filecoin-2": GasToken.FILECOIN,
        [EvmChain_1.EvmChain.OPTIMISM]: GasToken.ETH,
        [EvmChain_1.EvmChain.LINEA]: GasToken.ETH,
        [EvmChain_1.EvmChain.POLYGON_ZKEVM]: GasToken.POLYGON_ZKEVM,
        [EvmChain_1.EvmChain.MANTLE]: GasToken.MANTLE,
        [EvmChain_1.EvmChain.SCROLL]: GasToken.SCROLL,
        [EvmChain_1.EvmChain.SEPOLIA]: GasToken.SEPOLIA,
        [EvmChain_1.EvmChain.IMMUTABLE]: GasToken.IMMUTABLE,
        [EvmChain_1.EvmChain.ARBITRUM_SEPOLIA]: GasToken.ARBITRUM_SEPOLIA,
        [EvmChain_1.EvmChain.CENTRIFUGE_TESTNET]: GasToken.CENTRIFUGE,
        [EvmChain_1.EvmChain.FRAXTAL]: GasToken.FRAXTAL,
        [EvmChain_1.EvmChain.BLAST_SEPOLIA]: GasToken.BLAST_SEPOLIA,
        [EvmChain_1.EvmChain.MANTLE_SEPOLIA]: GasToken.MANTLE_SEPOLIA,
        [EvmChain_1.EvmChain.BASE_SEPOLIA]: GasToken.BASE_SEPOLIA,
        [EvmChain_1.EvmChain.OPTIMISM_SEPOLIA]: GasToken.OPTIMISM_SEPOLIA,
    },
    mainnet: {
        [EvmChain_1.EvmChain.AVALANCHE]: GasToken.AVAX,
        [EvmChain_1.EvmChain.MOONBEAM]: GasToken.GLMR,
        [EvmChain_1.EvmChain.POLYGON]: GasToken.MATIC,
        [EvmChain_1.EvmChain.ETHEREUM]: GasToken.ETH,
        [EvmChain_1.EvmChain.FANTOM]: GasToken.FTM,
        [EvmChain_1.EvmChain.AURORA]: GasToken.AURORA,
        [EvmChain_1.EvmChain.BINANCE]: GasToken.BINANCE,
        [EvmChain_1.EvmChain.ARBITRUM]: GasToken.ETH,
        [EvmChain_1.EvmChain.CELO]: GasToken.CELO,
        [EvmChain_1.EvmChain.KAVA]: GasToken.KAVA,
        [EvmChain_1.EvmChain.BASE]: GasToken.BASE,
        [EvmChain_1.EvmChain.FILECOIN]: GasToken.FILECOIN,
        [EvmChain_1.EvmChain.OPTIMISM]: GasToken.ETH,
        [EvmChain_1.EvmChain.LINEA]: GasToken.ETH,
        [EvmChain_1.EvmChain.POLYGON_ZKEVM]: GasToken.POLYGON_ZKEVM,
        [EvmChain_1.EvmChain.MANTLE]: GasToken.MANTLE,
        [EvmChain_1.EvmChain.SCROLL]: GasToken.SCROLL,
        [EvmChain_1.EvmChain.CENTRIFUGE]: GasToken.CENTRIFUGE,
        [EvmChain_1.EvmChain.FRAXTAL]: GasToken.FRAXTAL,
        [EvmChain_1.EvmChain.BLAST]: GasToken.BLAST,
    },
};
exports.DEFAULT_ESTIMATED_GAS = 700000;
//# sourceMappingURL=GasToken.js.map