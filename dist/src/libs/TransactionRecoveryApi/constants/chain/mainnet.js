"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkInfo = exports.rpcMap = void 0;
const EvmChain_1 = require("../../../../constants/EvmChain");
exports.rpcMap = {
    [EvmChain_1.EvmChain.FANTOM]: "https://rpc.ftm.tools",
    [EvmChain_1.EvmChain.POLYGON]: "https://polygon-rpc.com",
    [EvmChain_1.EvmChain.MOONBEAM]: "https://rpc.api.moonbeam.network",
    [EvmChain_1.EvmChain.AVALANCHE]: "https://api.avax.network/ext/bc/C/rpc",
    [EvmChain_1.EvmChain.ETHEREUM]: "https://ethereum.publicnode.com",
    [EvmChain_1.EvmChain.AURORA]: "https://mainnet.aurora.dev",
    [EvmChain_1.EvmChain.BINANCE]: "https://bsc-dataseed.binance.org",
    [EvmChain_1.EvmChain.ARBITRUM]: "https://arb1.arbitrum.io/rpc",
    [EvmChain_1.EvmChain.CELO]: "https://forno.celo.org",
    [EvmChain_1.EvmChain.KAVA]: "https://evm.kava.io",
    [EvmChain_1.EvmChain.FILECOIN]: "https://api.node.glif.io/rpc/v1",
    [EvmChain_1.EvmChain.OPTIMISM]: "https://optimism-mainnet.public.blastapi.io",
    [EvmChain_1.EvmChain.BASE]: "https://developer-access-mainnet.base.org",
    [EvmChain_1.EvmChain.LINEA]: "https://rpc.linea.build",
    [EvmChain_1.EvmChain.POLYGON_ZKEVM]: "https://zkevm.polygonscan.com",
    [EvmChain_1.EvmChain.MANTLE]: "https://rpc.mantle.xyz",
    [EvmChain_1.EvmChain.SCROLL]: "https://rpc.scroll.io",
    [EvmChain_1.EvmChain.CENTRIFUGE]: "https://fullnode.parachain.centrifuge.io",
    [EvmChain_1.EvmChain.IMMUTABLE]: "https://rpc.immutable.com",
    [EvmChain_1.EvmChain.FRAXTAL]: "https://rpc.frax.com",
    [EvmChain_1.EvmChain.BLAST]: "https://rpc.blast.io",
};
exports.networkInfo = {
    [EvmChain_1.EvmChain.FANTOM]: {
        chainId: 250,
        name: EvmChain_1.EvmChain.FANTOM,
    },
    [EvmChain_1.EvmChain.BASE]: {
        chainId: 8453,
        name: EvmChain_1.EvmChain.BASE,
    },
    [EvmChain_1.EvmChain.FILECOIN]: {
        chainId: 314,
        name: EvmChain_1.EvmChain.FILECOIN,
    },
    [EvmChain_1.EvmChain.POLYGON]: {
        chainId: 137,
        name: EvmChain_1.EvmChain.POLYGON,
    },
    [EvmChain_1.EvmChain.MOONBEAM]: {
        chainId: 1284,
        name: EvmChain_1.EvmChain.MOONBEAM,
    },
    [EvmChain_1.EvmChain.AVALANCHE]: {
        chainId: 43114,
        name: EvmChain_1.EvmChain.AVALANCHE,
    },
    [EvmChain_1.EvmChain.ETHEREUM]: {
        chainId: 1,
        name: EvmChain_1.EvmChain.ETHEREUM,
    },
    [EvmChain_1.EvmChain.AURORA]: {
        chainId: 1313161554,
        name: EvmChain_1.EvmChain.AURORA,
    },
    [EvmChain_1.EvmChain.BINANCE]: {
        chainId: 56,
        name: EvmChain_1.EvmChain.BINANCE,
    },
    [EvmChain_1.EvmChain.ARBITRUM]: {
        chainId: 42161,
        name: EvmChain_1.EvmChain.ARBITRUM,
    },
    [EvmChain_1.EvmChain.CELO]: {
        chainId: 42220,
        name: EvmChain_1.EvmChain.CELO,
    },
    [EvmChain_1.EvmChain.KAVA]: {
        chainId: 2222,
        name: EvmChain_1.EvmChain.KAVA,
    },
    [EvmChain_1.EvmChain.OPTIMISM]: {
        chainId: 10,
        name: EvmChain_1.EvmChain.OPTIMISM,
    },
    [EvmChain_1.EvmChain.LINEA]: {
        chainId: 59144,
        name: EvmChain_1.EvmChain.LINEA,
    },
    [EvmChain_1.EvmChain.POLYGON_ZKEVM]: {
        chainId: 1101,
        name: EvmChain_1.EvmChain.POLYGON_ZKEVM,
    },
    [EvmChain_1.EvmChain.MANTLE]: {
        chainId: 5000,
        name: EvmChain_1.EvmChain.MANTLE,
    },
    [EvmChain_1.EvmChain.SCROLL]: {
        chainId: 534352,
        name: EvmChain_1.EvmChain.SCROLL,
    },
    [EvmChain_1.EvmChain.CENTRIFUGE]: {
        chainId: 2031,
        name: EvmChain_1.EvmChain.CENTRIFUGE,
    },
    [EvmChain_1.EvmChain.IMMUTABLE]: {
        chainId: 13371,
        name: EvmChain_1.EvmChain.IMMUTABLE,
    },
    [EvmChain_1.EvmChain.FRAXTAL]: {
        chainId: 252,
        name: EvmChain_1.EvmChain.FRAXTAL,
    },
    [EvmChain_1.EvmChain.BLAST]: {
        chainId: 81457,
        name: EvmChain_1.EvmChain.BLAST,
    },
};
//# sourceMappingURL=mainnet.js.map