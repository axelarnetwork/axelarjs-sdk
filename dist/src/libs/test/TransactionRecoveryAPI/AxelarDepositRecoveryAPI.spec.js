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
const AxelarDepositRecoveryAPI_1 = require("../../TransactionRecoveryApi/AxelarDepositRecoveryAPI");
const types_1 = require("../../types");
describe.skip("AxelarDepositRecoveryAPI", () => {
    const api = new AxelarDepositRecoveryAPI_1.AxelarDepositRecoveryAPI({ environment: types_1.Environment.TESTNET });
    beforeEach(() => {
        vitest.clearAllMocks();
    });
    describe.skip("confirmDeposit", () => {
        test("It should confirm a deposit", () => __awaiter(void 0, void 0, void 0, function* () {
            const testParamsAxelarnet = {
                hash: "FD6F3C9E63A8A0F47092418CCF3A70D52642B77B940FB6D2BE5A797D7AA97BEB",
                from: "Osmosis",
                depositAddress: "axelar192mp2cv2s0hayv6fwgjl64zs72hl97zcxjwcg6g8nkdkjxq89dps0yt6gc",
                denom: "wavax-wei",
            };
            //   const testParamsEvm: ConfirmDepositRequest = {
            //     hash: "0xaea3b215c6a79a47b31f85253f788e928b37a9fe2cfad8484cc6b2a65226d32c",
            //     from: "Avalanche",
            //     depositAddress: "0xe74e43b70bc841011288aa510456fd942596a685",
            //     amount: "2000000",
            //     signature: "", // this won't be used because single signer
            //     token: "uusd"
            // }
            const confirmation = yield api.confirmDeposit(testParamsAxelarnet);
            console.log("confirmation", confirmation);
            expect(confirmation).toBeTruthy();
            // expect(confirmation?.status).toBeTruthy();
            // expect(confirmation?.data).toBeTruthy();
            // expect(confirmation?.data?.hash).toBeTruthy();
            // expect(confirmation?.data?.depositTxHash).toEqual(testParamsAxelarnet.hash);
            // expect(confirmation?.data?.depositAddress.toLowerCase()).toEqual(testParamsAxelarnet.depositAddress.toLowerCase());
            // expect(confirmation?.data?.chain).toEqual(testParamsAxelarnet.from);
            // expect(confirmation?.data?.amount).toEqual(testParams.amount);
        }), 60000);
    });
});
//# sourceMappingURL=AxelarDepositRecoveryAPI.spec.js.map