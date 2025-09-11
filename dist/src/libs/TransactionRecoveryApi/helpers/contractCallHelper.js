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
exports.CALL_EXECUTE_ERROR = void 0;
exports.callExecute = callExecute;
var CALL_EXECUTE_ERROR;
(function (CALL_EXECUTE_ERROR) {
    CALL_EXECUTE_ERROR["REVERT"] = "REVERT";
    CALL_EXECUTE_ERROR["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
})(CALL_EXECUTE_ERROR || (exports.CALL_EXECUTE_ERROR = CALL_EXECUTE_ERROR = {}));
function callExecute(params_1, contract_1) {
    return __awaiter(this, arguments, void 0, function* (params, contract, gasLimitBuffer = 0) {
        const { commandId, isContractCallWithToken, payload, sourceAddress, sourceChain, amount, symbol, } = params;
        let txReceipt;
        if (isContractCallWithToken) {
            // Checking if the destination contract call reverted
            const estimatedGas = yield contract.estimateGas
                .executeWithToken(commandId, sourceChain, sourceAddress, payload, symbol, amount)
                .catch(() => undefined);
            if (!estimatedGas)
                throw new Error(CALL_EXECUTE_ERROR.REVERT);
            txReceipt = contract
                .executeWithToken(commandId, sourceChain, sourceAddress, payload, symbol, amount, {
                gasLimit: estimatedGas.add(gasLimitBuffer),
            })
                .then((tx) => tx.wait())
                .catch(() => undefined);
        }
        else {
            // Checking if the destination contract call reverted
            const estimatedGas = yield contract.estimateGas
                .execute(commandId, sourceChain, sourceAddress, payload)
                .catch(() => undefined);
            if (!estimatedGas)
                throw new Error(CALL_EXECUTE_ERROR.REVERT);
            txReceipt = contract
                .execute(commandId, sourceChain, sourceAddress, payload, {
                gasLimit: estimatedGas.add(gasLimitBuffer),
            })
                .then((tx) => tx.wait())
                .catch(() => undefined);
        }
        if (!txReceipt)
            throw new Error(CALL_EXECUTE_ERROR.INSUFFICIENT_FUNDS);
        return txReceipt;
    });
}
//# sourceMappingURL=contractCallHelper.js.map