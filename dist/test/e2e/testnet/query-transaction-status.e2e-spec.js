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
const src_1 = require("../../../src");
describe("Query Transaction Status", () => {
    let sdk;
    beforeAll(() => {
        sdk = new src_1.AxelarRecoveryApi({
            environment: src_1.Environment.TESTNET,
        });
    });
    it("should include timeSpent", () => __awaiter(void 0, void 0, void 0, function* () {
        // the sample tx hashes are from the testnet
        // it contains all finalized statuses to ensure the `timeSpent` is always included.
        const sampleTxHashes = [
            "0xd563e708d99da0c7d7cdd613183d6a45f21dd0e1237cd5568551861f3bf3767a", // failed
            "0x085ad5106880b7a4ecf9ea3ecba3e5637aa6acdeac7158080aa65033aa5731d9", // executed
        ];
        const response = yield Promise.all(sampleTxHashes.map((hash) => sdk.queryTransactionStatus(hash)));
        const timeSpents = response.map((result) => result.timeSpent);
        for (const timeSpent of timeSpents) {
            expect(timeSpent).toBeDefined();
            expect(timeSpent === null || timeSpent === void 0 ? void 0 : timeSpent.total).toBeDefined();
        }
    }));
}, {
    timeout: 20000,
});
//# sourceMappingURL=query-transaction-status.e2e-spec.js.map