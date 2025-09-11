"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fork = fork;
const ethers_1 = require("ethers");
const ganache_1 = __importDefault(require("ganache"));
const chain_1 = __importDefault(require("../../TransactionRecoveryApi/constants/chain"));
function fork(evmChain, options = {
    impersonateAccounts: [],
    defaultBalance: 1000,
}) {
    const ganacheProvider = ganache_1.default.provider({
        wallet: {
            unlockedAccounts: options.impersonateAccounts,
            defaultBalance: options.defaultBalance,
        },
        fork: {
            url: chain_1.default.testnet.rpcMap[evmChain],
            blockNumber: options === null || options === void 0 ? void 0 : options.blockNumber,
        },
        chain: {
            vmErrorsOnRPCResponse: true,
        },
        logging: {
            quiet: true,
        },
    });
    return new ethers_1.ethers.providers.Web3Provider(ganacheProvider);
}
//# sourceMappingURL=localChain.js.map