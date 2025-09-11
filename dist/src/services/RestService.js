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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestService = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const standard_http_error_1 = __importDefault(require("standard-http-error"));
class RestService {
    constructor(host) {
        this.host = host;
    }
    post(url, body, traceId) {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-trace-id": traceId || "none",
            },
            body: JSON.stringify(body),
        };
        return this.execRest(url, requestOptions);
    }
    get(url, traceId) {
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-trace-id": traceId || "none",
            },
        };
        return this.execRest(url, requestOptions);
    }
    execRest(endpoint, requestOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, cross_fetch_1.default)(this.host + endpoint, requestOptions)
                .then((response) => {
                if (!response.ok)
                    throw response;
                return response;
            })
                .then((response) => response.json())
                .catch((err) => __awaiter(this, void 0, void 0, function* () {
                let msg;
                try {
                    msg = yield err.json();
                }
                catch (_) {
                    msg = yield err.text();
                }
                const error = new standard_http_error_1.default(err.status, (msg === null || msg === void 0 ? void 0 : msg.message) || Object.keys(msg).length > 0 ? msg : err.statusText);
                throw error;
            }));
        });
    }
}
exports.RestService = RestService;
//# sourceMappingURL=RestService.js.map