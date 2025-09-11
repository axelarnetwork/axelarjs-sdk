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
const AxelarGMPRecoveryAPI_1 = require("../../TransactionRecoveryApi/AxelarGMPRecoveryAPI");
const types_1 = require("../../types");
const EvmChain_1 = require("../../../constants/EvmChain");
const axelar_local_dev_1 = require("@axelar-network/axelar-local-dev");
describe("AxelarDepositRecoveryAPI", () => {
    const { setLogger } = axelar_local_dev_1.utils;
    setLogger(() => null);
    let evmWalletDetails;
    beforeEach(() => {
        vitest.clearAllMocks();
        evmWalletDetails = {
            privateKey: "",
            useWindowEthereum: false,
        };
    });
    describe("manual relay", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        test("It should create a command ID from a tx hash and event index", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "0x0a83f6bff1697bb1f72ee60713427e802f32571f042abfa7c6278024f440e861";
            const res = yield api.manualRelayToDestChain(txHash, undefined, undefined, evmWalletDetails);
            expect(res).toBeTruthy();
        }), 120000);
    });
    describe.skip("creating command ID", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        test("It should create a command ID from a tx hash and event index", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "0x2c9083bebd1f82b86b7b0d3298885f90767b584742df9ec3a9c9f15872a1fff9";
            const eventIndex = yield api.getEventIndex("ethereum-2", txHash);
            const res = yield api.getCidFromSrcTxHash(EvmChain_1.EvmChain.MOONBEAM, txHash, eventIndex);
            expect(res).toEqual("58c46960e6483f61bf206d1bd1819917d2b009f58d7050e05b4be1d13247b4ed");
        }), 60000);
    });
    describe.skip("checking event status", () => {
        const api = new AxelarGMPRecoveryAPI_1.AxelarGMPRecoveryAPI({ environment: types_1.Environment.TESTNET });
        test("fetching event status", () => __awaiter(void 0, void 0, void 0, function* () {
            const txHash = "0xa290f800f2089535a0abb013cea9cb26e1cdb3f2a2f2a8dcef2f149eb7a4d3be";
            const event = yield api.getEvmEvent(EvmChain_1.EvmChain.MOONBEAM, EvmChain_1.EvmChain.POLYGON, txHash, undefined);
            console.log("event", event);
            const res = yield api.isEVMEventCompleted(event.eventResponse);
            expect(res).toBeTruthy();
        }), 60000);
    });
});
//# sourceMappingURL=EncodingTests.spec.js.map