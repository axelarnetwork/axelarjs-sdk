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
exports.retryRpc = retryRpc;
exports.wait = wait;
function retryRpc(retryFunc_1, errorHandler_1) {
    return __awaiter(this, arguments, void 0, function* (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retryFunc, errorHandler, msToRetry = 5000, maxRetries = 5, count = 0) {
        try {
            if (count >= maxRetries)
                return null;
            const response = yield retryFunc();
            return response;
        }
        catch (e) {
            errorHandler && errorHandler(e);
            yield wait(msToRetry);
            return retryRpc(retryFunc, errorHandler, msToRetry, maxRetries, count + 1);
        }
    });
}
function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
//# sourceMappingURL=retryRpc.js.map