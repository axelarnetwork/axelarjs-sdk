"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testnet_1 = require("./testnet");
const mainnet_1 = require("./mainnet");
const rpc = {
    devnet: {
        rpcMap: testnet_1.rpcMap,
        networkInfo: testnet_1.networkInfo,
    },
    testnet: {
        rpcMap: testnet_1.rpcMap,
        networkInfo: testnet_1.networkInfo,
    },
    mainnet: {
        rpcMap: mainnet_1.rpcMap,
        networkInfo: mainnet_1.networkInfo,
    },
};
exports.default = rpc;
//# sourceMappingURL=index.js.map