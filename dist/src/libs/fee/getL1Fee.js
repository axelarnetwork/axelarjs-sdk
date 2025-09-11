"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-return */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getL1FeeForL2 = getL1FeeForL2;
const ethers_1 = require("ethers");
const ABI = {
    Optimism: ["function getL1Fee(bytes executeData) view returns (uint256)"],
};
/**
 * Get the estimated L1 fee for a given L2 chain.
 * @param env The environment to use. Either "mainnet" or "testnet".
 * @param chain The destination L2 chain.
 * @param params The parameters to use for the estimation.
 * @returns The estimated L1 fee.
 */
function getL1FeeForL2(provider, params) {
    const { l1GasOracleAddress } = params;
    const _l1GasOracleAddress = l1GasOracleAddress || "0x420000000000000000000000000000000000000F";
    switch (params.l2Type) {
        case "op":
            return getOptimismL1Fee(provider, Object.assign(Object.assign({}, params), { l1GasOracleAddress: _l1GasOracleAddress }));
        // RPC clients for Arbitrum and Mantle include both L1 and L2 components in gasLimit.
        case "mantle":
        case "arb":
        default:
            return Promise.resolve(ethers_1.BigNumber.from(0));
    }
}
function getOptimismL1Fee(provider, estimateL1FeeParams) {
    return __awaiter(this, void 0, void 0, function* () {
        const { executeData, l1GasOracleAddress } = estimateL1FeeParams;
        const contract = new ethers_1.ethers.Contract(l1GasOracleAddress, ABI.Optimism, provider);
        return contract.getL1Fee(executeData);
    });
}
//# sourceMappingURL=getL1Fee.js.map