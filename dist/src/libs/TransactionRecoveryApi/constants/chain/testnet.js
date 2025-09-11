"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkInfo = exports.rpcMap = void 0;
const EvmChain_1 = require("../../../../constants/EvmChain");
exports.rpcMap = {
    [EvmChain_1.EvmChain.FANTOM]: "https://rpc.testnet.fantom.network",
    [EvmChain_1.EvmChain.POLYGON]: "https://polygon-mumbai-bor-rpc.publicnode.com",
    [EvmChain_1.EvmChain.MOONBEAM]: "https://rpc.api.moonbase.moonbeam.network",
    [EvmChain_1.EvmChain.AVALANCHE]: "https://api.avax-test.network/ext/bc/C/rpc",
    [EvmChain_1.EvmChain.AURORA]: "https://testnet.aurora.dev",
    [EvmChain_1.EvmChain.BINANCE]: "https://data-seed-prebsc-1-s1.binance.org:8545",
    [EvmChain_1.EvmChain.CELO]: "https://alfajores-forno.celo-testnet.org",
    [EvmChain_1.EvmChain.KAVA]: "https://evm.testnet.kava.io",
    "filecoin-2": "https://rpc.ankr.com/filecoin_testnet",
    [EvmChain_1.EvmChain.POLYGON_ZKEVM]: "https://testnet-zkevm.polygonscan.com",
    [EvmChain_1.EvmChain.SCROLL]: "https://sepolia-rpc.scroll.io",
    [EvmChain_1.EvmChain.IMMUTABLE]: "https://rpc.testnet.immutable.com",
    [EvmChain_1.EvmChain.SEPOLIA]: "https://1rpc.io/sepolia",
    [EvmChain_1.EvmChain.ARBITRUM_SEPOLIA]: "https://sepolia-rollup.arbitrum.io/rpc",
    [EvmChain_1.EvmChain.CENTRIFUGE_TESTNET]: "https://node-7118620155331796992.gx.onfinality.io/jsonrpc?apikey=00538f2d-6297-44e3-8812-4b9d579524b2",
    [EvmChain_1.EvmChain.FRAXTAL]: "https://rpc.testnet.frax.com",
    [EvmChain_1.EvmChain.BLAST_SEPOLIA]: "https://sepolia.blast.io",
    [EvmChain_1.EvmChain.BASE_SEPOLIA]: "https://sepolia.base.org",
    [EvmChain_1.EvmChain.OPTIMISM_SEPOLIA]: "https://sepolia.optimism.io",
    [EvmChain_1.EvmChain.MANTLE_SEPOLIA]: "https://rpc.sepolia.mantle.xyz",
    [EvmChain_1.EvmChain.POLYGON_SEPOLIA]: "https://rpc-amoy.polygon.technology",
    [EvmChain_1.EvmChain.LINEA_SEPOLIA]: "https://rpc.sepolia.linea.build",
};
exports.networkInfo = {
    [EvmChain_1.EvmChain.FANTOM]: {
        chainId: 4002,
        name: EvmChain_1.EvmChain.FANTOM,
    },
    [EvmChain_1.EvmChain.POLYGON]: {
        chainId: 80001,
        name: EvmChain_1.EvmChain.POLYGON,
    },
    [EvmChain_1.EvmChain.POLYGON_ZKEVM]: {
        chainId: 1442,
        name: EvmChain_1.EvmChain.POLYGON_ZKEVM,
    },
    [EvmChain_1.EvmChain.MOONBEAM]: {
        chainId: 1287,
        name: EvmChain_1.EvmChain.MOONBEAM,
    },
    [EvmChain_1.EvmChain.AVALANCHE]: {
        chainId: 43113,
        name: EvmChain_1.EvmChain.AVALANCHE,
    },
    [EvmChain_1.EvmChain.AURORA]: {
        chainId: 1313161555,
        name: EvmChain_1.EvmChain.AURORA,
    },
    [EvmChain_1.EvmChain.BINANCE]: {
        chainId: 97,
        name: EvmChain_1.EvmChain.BINANCE,
    },
    [EvmChain_1.EvmChain.CELO]: {
        chainId: 44787,
        name: EvmChain_1.EvmChain.CELO,
    },
    [EvmChain_1.EvmChain.KAVA]: {
        chainId: 2221,
        name: EvmChain_1.EvmChain.KAVA,
    },
    "filecoin-2": {
        chainId: 314159,
        name: EvmChain_1.EvmChain.FILECOIN,
    },
    [EvmChain_1.EvmChain.LINEA]: {
        chainId: 59140,
        name: EvmChain_1.EvmChain.LINEA,
    },
    [EvmChain_1.EvmChain.SCROLL]: {
        chainId: 534351,
        name: EvmChain_1.EvmChain.SCROLL,
    },
    [EvmChain_1.EvmChain.SEPOLIA]: {
        chainId: 11155111,
        name: EvmChain_1.EvmChain.SEPOLIA,
    },
    [EvmChain_1.EvmChain.ARBITRUM_SEPOLIA]: {
        chainId: 421614,
        name: EvmChain_1.EvmChain.ARBITRUM_SEPOLIA,
    },
    [EvmChain_1.EvmChain.CENTRIFUGE_TESTNET]: {
        chainId: 2090,
        name: "centrifuge",
    },
    [EvmChain_1.EvmChain.IMMUTABLE]: {
        chainId: 13473,
        name: EvmChain_1.EvmChain.IMMUTABLE,
    },
    [EvmChain_1.EvmChain.FRAXTAL]: {
        chainId: 2522,
        name: EvmChain_1.EvmChain.FRAXTAL,
    },
    [EvmChain_1.EvmChain.BASE_SEPOLIA]: {
        chainId: 84532,
        name: EvmChain_1.EvmChain.BASE_SEPOLIA,
    },
    [EvmChain_1.EvmChain.BLAST_SEPOLIA]: {
        chainId: 168587773,
        name: EvmChain_1.EvmChain.BLAST_SEPOLIA,
    },
    [EvmChain_1.EvmChain.MANTLE_SEPOLIA]: {
        chainId: 5003,
        name: EvmChain_1.EvmChain.MANTLE_SEPOLIA,
    },
    [EvmChain_1.EvmChain.OPTIMISM_SEPOLIA]: {
        chainId: 11155420,
        name: EvmChain_1.EvmChain.OPTIMISM_SEPOLIA,
    },
    [EvmChain_1.EvmChain.POLYGON_SEPOLIA]: {
        chainId: 80002,
        name: EvmChain_1.EvmChain.POLYGON_SEPOLIA,
    },
    [EvmChain_1.EvmChain.LINEA_SEPOLIA]: {
        chainId: 59141,
        name: EvmChain_1.EvmChain.LINEA_SEPOLIA,
    },
};
//# sourceMappingURL=testnet.js.map