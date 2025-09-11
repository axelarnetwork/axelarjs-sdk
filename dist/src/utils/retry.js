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
exports.retry = retry;
function retry(fn_1) {
    return __awaiter(this, arguments, void 0, function* (fn, maxRetries = 5, delay = 3000) {
        let error;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return yield fn();
            }
            catch (e) {
                error = e;
                yield new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw error;
    });
}
//# sourceMappingURL=retry.js.map