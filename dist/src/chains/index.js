"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.loadChains = loadChains;
exports.importS3Config = importS3Config;
exports.importChains = importChains;
__exportStar(require("./supported-chains-list"), exports);
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const assets_1 = require("../assets");
const clone_deep_1 = __importDefault(require("clone-deep"));
function loadChains(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const allAssets = yield (0, assets_1.loadAssets)(config);
        const _environment = config.environment;
        const rawChains = yield importChains({ environment: _environment });
        /*push assets to supported chains*/
        rawChains.forEach((chainInfo) => {
            const filteredAssetList = allAssets.filter(({ chain_aliases }) => Object.keys(chain_aliases).indexOf(chainInfo.chainName.toLowerCase()) > -1);
            const assetsList = [];
            filteredAssetList.forEach((asset) => {
                const assetToPush = (0, clone_deep_1.default)(asset.chain_aliases[chainInfo.chainName.toLowerCase()]);
                assetToPush.common_key = asset.common_key[_environment];
                assetToPush.native_chain = asset.native_chain;
                assetToPush.decimals = asset.decimals;
                assetToPush.fullySupported = asset.fully_supported;
                assetsList.push(assetToPush);
            });
            chainInfo.assets = assetsList;
        });
        return rawChains;
    });
}
const s3UrlMap = {
    "devnet-amplifier": "https://axelar-devnets.s3.us-east-2.amazonaws.com/configs/devnet-amplifier-config-1.0.x.json",
    testnet: "https://axelar-testnet.s3.us-east-2.amazonaws.com/configs/testnet-config-1.x.json",
    mainnet: "https://axelar-mainnet.s3.us-east-2.amazonaws.com/configs/mainnet-config-1.x.json",
};
const urlMap = {
    "devnet-amplifier": "https://static.npty.online/axelar/devnet-amplifier-chain-config.json",
    testnet: "https://axelar-testnet.s3.us-east-2.amazonaws.com/testnet-chain-config.json",
    mainnet: "https://axelar-mainnet.s3.us-east-2.amazonaws.com/mainnet-chain-config.json",
};
const chainMap = {
    "devnet-amplifier": null,
    testnet: null,
    mainnet: null,
};
const s3Map = {
    "devnet-amplifier": null,
    testnet: null,
    mainnet: null,
};
function importS3Config(environment) {
    return __awaiter(this, void 0, void 0, function* () {
        if (s3Map[environment])
            return s3Map[environment];
        s3Map[environment] = yield execGet(s3UrlMap[environment]);
        return s3Map[environment];
    });
}
function importChains(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (chainMap[config.environment])
            return Object.values(chainMap[config.environment]);
        chainMap[config.environment] = yield execGet(urlMap[config.environment]);
        return Object.values(chainMap[config.environment]);
    });
}
function execGet(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, cross_fetch_1.default)(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .catch((error) => {
            throw error;
        });
    });
}
//# sourceMappingURL=index.js.map