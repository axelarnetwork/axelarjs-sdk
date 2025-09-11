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
const constants_1 = require("../../../constants");
const TransactionRecoveryApi_1 = require("../../TransactionRecoveryApi");
const types_1 = require("../../types");
const stubs_1 = require("../stubs");
describe("AxelarTransferApi", () => {
    const api = new TransactionRecoveryApi_1.AxelarTransferApi({ environment: types_1.Environment.TESTNET });
    it("should return error given the transfer api could not be reached", () => __awaiter(void 0, void 0, void 0, function* () {
        vitest.spyOn(api.axelarCrosschainApi, "post").mockRejectedValueOnce(undefined);
        const response = yield api.queryTransferStatus("0x123");
        expect(response.success).toBe(false);
        expect(response.error).toBe("Axelar Transfer API is not available");
    }));
    it("should return error when no transfer is found", () => __awaiter(void 0, void 0, void 0, function* () {
        vitest.spyOn(api.axelarCrosschainApi, "post").mockResolvedValueOnce([]);
        const response = yield api.queryTransferStatus("0x123");
        expect(response.success).toBe(false);
        expect(response.error).toBe("No transfer found");
    }));
    it("should query transfer status successfully when given tx hash is valid", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockResponse = (0, stubs_1.transferResponseExecutedStub)();
        vitest.spyOn(api.axelarCrosschainApi, "post").mockResolvedValueOnce(mockResponse);
        const response = yield api.queryTransferStatus("6D1B1CD4B754280461BD7AD43B4838BBD8A467AA346B7584052025F83B5EB90F");
        expect(response.success).toBe(true);
        expect(response.data).toEqual({
            id: mockResponse[0].source.id,
            status: mockResponse[0].status,
            type: mockResponse[0].source.type,
            amount: mockResponse[0].source.amount,
            fee: mockResponse[0].source.fee,
            denom: mockResponse[0].source.denom,
            senderChain: mockResponse[0].source.sender_chain,
            senderAddress: mockResponse[0].source.sender_address,
            recipientChain: mockResponse[0].source.recipient_chain,
            recipientAddress: mockResponse[0].source.recipient_address,
            blockHeight: mockResponse[0].source.height,
            blockExplorerUrl: `${(0, constants_1.getConfigs)(types_1.Environment.TESTNET).axelarscanUrl}/transfer/${mockResponse[0].source.id}`,
        });
    }));
});
//# sourceMappingURL=AxelarTransferAPI.spec.js.map