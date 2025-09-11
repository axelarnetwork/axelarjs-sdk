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
exports.loadAssets = loadAssets;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const urlMap = {
    "devnet-amplifier": "https://axelar-testnet.s3.us-east-2.amazonaws.com/devnet-asset-config.json",
    testnet: "https://axelar-testnet.s3.us-east-2.amazonaws.com/testnet-asset-config.json",
    mainnet: "https://axelar-mainnet.s3.us-east-2.amazonaws.com/mainnet-asset-config.json",
};
const assetMap = {
    "devnet-amplifier": null,
    testnet: null,
    mainnet: null,
};
function loadAssets(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (assetMap[config.environment])
            return Object.values(assetMap[config.environment]);
        assetMap[config.environment] = yield execGet(urlMap[config.environment]);
        return Object.values(assetMap[config.environment]);
    });
}
function execGet(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, cross_fetch_1.default)(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .catch((error) => {
            console.log({ error });
            throw error;
        });
    });
}
//# sourceMappingURL=index.js.map