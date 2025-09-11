"use strict";
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
const ethers_1 = require("ethers");
const mainnet_1 = require("../TransactionRecoveryApi/constants/chain/mainnet");
const types_1 = require("../types");
const getL1Fee_1 = require("./getL1Fee");
const AxelarQueryAPI_1 = require("../AxelarQueryAPI");
const constants_1 = require("../../constants");
const env = types_1.Environment.MAINNET;
function getL1Fee(srcChain, destChain) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryAPI = new AxelarQueryAPI_1.AxelarQueryAPI({ environment: env });
        const { destToken, l2_type } = yield queryAPI.getNativeGasBaseFee(srcChain, destChain);
        const params = {
            executeData: constants_1.DEFAULT_L1_EXECUTE_DATA,
            destChain,
            l1GasPrice: destToken.l1_gas_price_in_units,
            l1GasOracleAddress: destToken.l1_gas_oracle_address,
            l2Type: l2_type,
        };
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(mainnet_1.rpcMap[destChain]);
        const fee = yield (0, getL1Fee_1.getL1FeeForL2)(provider, params);
        return fee;
    });
}
describe("getL1Fee", () => {
    it("query l1 fee for l2 chains should work", () => __awaiter(void 0, void 0, void 0, function* () {
        const srcChain = "ethereum";
        const destChainsThatShouldIncludeL1Fees = ["optimism", "blast", "fraxtal", "base", "scroll"];
        const l1FeeQueries = destChainsThatShouldIncludeL1Fees.map((destChain) => getL1Fee(srcChain, destChain));
        const fees = yield Promise.all(l1FeeQueries);
        expect(fees.length).toBe(destChainsThatShouldIncludeL1Fees.length);
        expect(fees.every((fee) => fee.gt(0))).toBe(true);
        const destChainsThatShouldNotIncludeL1Fees = ["mantle", "arbitrum"];
        const ZeroL1FeeQueries = destChainsThatShouldNotIncludeL1Fees.map((destChain) => getL1Fee(srcChain, destChain));
        const fees2 = yield Promise.all(ZeroL1FeeQueries);
        expect(fees2.length).toBe(destChainsThatShouldNotIncludeL1Fees.length);
        expect(fees2.every((fee) => fee.eq(0))).toBe(true);
    }));
});
//# sourceMappingURL=getL1Fee.spec.js.map