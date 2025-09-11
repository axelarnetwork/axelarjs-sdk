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
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const standard_http_error_1 = __importDefault(require("standard-http-error"));
const RestService_1 = require("../RestService");
const mockedFetch = cross_fetch_1.default;
vitest.mock("cross-fetch", () => {
    // Mock the default export
    return {
        __esModule: true,
        default: vitest.fn(),
    };
});
describe("RestService", () => {
    const host = "http://localhost:3000";
    const api = new RestService_1.RestService(host);
    beforeEach(() => {
        vitest.clearAllMocks();
    });
    describe("execRest()", () => {
        describe("when error", () => {
            describe("when text response", () => {
                beforeAll(() => {
                    mockedFetch.mockRejectedValue({
                        status: 400,
                        text: () => "hello world",
                    });
                });
                it("should throw error", () => __awaiter(void 0, void 0, void 0, function* () {
                    const error = new standard_http_error_1.default(400, "hello world");
                    expect(api.get("/")).rejects.toThrow(error);
                }));
            });
            describe("when json response", () => {
                beforeAll(() => {
                    mockedFetch.mockRejectedValue({
                        status: 403,
                        json: () => ({
                            message: "Forbidden",
                        }),
                    });
                });
                it("should return error", () => __awaiter(void 0, void 0, void 0, function* () {
                    const error = new standard_http_error_1.default(403, "Forbidden");
                    expect(api.get("/")).rejects.toThrow(error);
                }));
            });
        });
        describe("when success", () => {
            let res;
            beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                mockedFetch.mockResolvedValue({
                    status: 200,
                    ok: true,
                    json: () => ({ foo: "bar" }),
                });
                res = yield api.get("/");
            }));
            it("should return json", () => {
                expect(res.foo).toEqual("bar");
            });
        });
    });
});
//# sourceMappingURL=RestService.spec.js.map