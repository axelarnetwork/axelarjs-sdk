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
const types_1 = require("../types");
const AxelarQueryClient_1 = require("../AxelarQueryClient");
describe("AxelarQueryClient", () => {
    const config = { environment: types_1.Environment.TESTNET };
    beforeEach(() => {
        vitest.clearAllMocks();
    });
    describe("Axelar queries", () => {
        test("It should be able to query the evm module", () => __awaiter(void 0, void 0, void 0, function* () {
            const api = yield AxelarQueryClient_1.AxelarQueryClient.initOrGetAxelarQueryClient(config);
            const params = { chain: "avalanche", id: "" };
            const result = yield api.evm.BatchedCommands(params);
            expect(result).toBeDefined();
            expect(result.commandIds).toBeDefined();
            expect(result.executeData).toBeDefined();
            expect(result.prevBatchedCommandsId).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.data).toBeDefined();
            expect(result.status).toBeDefined();
            expect(result.keyId).toBeDefined();
        }), 60000);
        test("It should be able to query the nexus module", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            const api = yield AxelarQueryClient_1.AxelarQueryClient.initOrGetAxelarQueryClient(config);
            const params = { chain: "avalanche", asset: "wavax-wei" };
            const result = yield api.nexus.FeeInfo(params);
            expect(result).toBeDefined();
            expect((_a = result.feeInfo) === null || _a === void 0 ? void 0 : _a.asset).toBeDefined();
            expect((_b = result.feeInfo) === null || _b === void 0 ? void 0 : _b.chain).toEqual("avalanche");
            expect((_c = result.feeInfo) === null || _c === void 0 ? void 0 : _c.feeRate).toBeDefined();
        }), 60000);
        test("It should be able to query the axelarnet module", () => __awaiter(void 0, void 0, void 0, function* () {
            const api = yield AxelarQueryClient_1.AxelarQueryClient.initOrGetAxelarQueryClient(config);
            const params = { chain: "osmosis-3" };
            const result = yield api.axelarnet.PendingIBCTransferCount(params);
            expect(result).toBeDefined();
            expect(result.transfersByChain).toBeDefined();
        }), 60000);
        // test("It should be able to query the tss module", async () => {
        //   const api: AxelarQueryClientType = await AxelarQueryClient.initOrGetAxelarQueryClient(config);
        //   const params: NextKeyIDRequest = { chain: "avalanche", keyRole: 1 };
        //   const result: NextKeyIDResponse = await api.tss.NextKeyID(params);
        //   expect(result).toBeDefined();
        //   expect(result.keyId).toBeDefined();
        // }, 60000);
    });
});
//# sourceMappingURL=AxelarQueryClient.spec.js.map