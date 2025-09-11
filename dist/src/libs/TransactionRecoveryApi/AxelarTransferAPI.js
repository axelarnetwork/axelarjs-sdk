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
exports.AxelarTransferApi = void 0;
const constants_1 = require("../../constants");
const services_1 = require("../../services");
class AxelarTransferApi {
    constructor(config) {
        const environment = config.environment;
        const links = (0, constants_1.getConfigs)(environment);
        this.axelarCrosschainUrl = links.axelarCrosschainApiUrl;
        this.axelarnscanUrl = links.axelarscanUrl;
        this.axelarCrosschainApi = new services_1.RestService(this.axelarCrosschainUrl);
    }
    queryTransferStatus(txHash, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axelarCrosschainApi
                .post("/transfers-status", Object.assign({ txHash }, options))
                .catch(() => undefined);
            if (!response) {
                return {
                    success: false,
                    error: "Axelar Transfer API is not available",
                };
            }
            if (response.length === 0) {
                return {
                    success: false,
                    error: "No transfer found",
                };
            }
            const transfer = response[0];
            return {
                success: true,
                data: {
                    id: transfer.source.id,
                    status: transfer.status,
                    type: transfer.source.type,
                    amount: transfer.source.amount,
                    fee: transfer.source.fee,
                    denom: transfer.source.denom,
                    senderChain: transfer.source.sender_chain,
                    senderAddress: transfer.source.sender_address,
                    recipientChain: transfer.source.recipient_chain,
                    recipientAddress: transfer.source.recipient_address,
                    blockExplorerUrl: `${this.axelarnscanUrl}/transfer/${transfer.source.id}`,
                    blockHeight: transfer.source.height,
                },
            };
        });
    }
}
exports.AxelarTransferApi = AxelarTransferApi;
//# sourceMappingURL=AxelarTransferAPI.js.map