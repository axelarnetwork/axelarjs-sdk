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
exports.validateDestinationAddressByChainSymbol = validateDestinationAddressByChainSymbol;
exports.validateDestinationAddressByChainName = validateDestinationAddressByChainName;
const chains_1 = require("../chains");
const utils_1 = require("ethers/lib/utils");
const bech32_1 = require("bech32");
function validateDestinationAddressByChainSymbol(chainSymbol, destinationAddress, environment) {
    return __awaiter(this, void 0, void 0, function* () {
        const chains = yield (0, chains_1.loadChains)({
            environment,
        });
        const targetChain = chains.find((chainInfo) => chainInfo.chainSymbol.toLowerCase() === chainSymbol.toLowerCase());
        return (targetChain === null || targetChain === void 0 ? void 0 : targetChain.module) === "evm"
            ? (0, utils_1.isAddress)(destinationAddress)
            : destinationAddress &&
                (targetChain === null || targetChain === void 0 ? void 0 : targetChain.addressPrefix) &&
                checkPrefix(destinationAddress, targetChain === null || targetChain === void 0 ? void 0 : targetChain.addressPrefix);
    });
}
function validateDestinationAddressByChainName(chainIdentifier, destinationAddress, environment) {
    return __awaiter(this, void 0, void 0, function* () {
        const chains = yield (0, chains_1.loadChains)({
            environment,
        });
        const targetChain = chains.find((chainInfo) => chainInfo.chainIdentifier[environment] === chainIdentifier.toLowerCase());
        return (targetChain === null || targetChain === void 0 ? void 0 : targetChain.module) === "evm"
            ? (0, utils_1.isAddress)(destinationAddress)
            : destinationAddress &&
                (targetChain === null || targetChain === void 0 ? void 0 : targetChain.addressPrefix) &&
                checkPrefix(destinationAddress, targetChain === null || targetChain === void 0 ? void 0 : targetChain.addressPrefix);
    });
}
const checkPrefix = (address, addressPrefix) => {
    if (!address)
        return false;
    try {
        return bech32_1.bech32.decode(address).prefix === addressPrefix;
    }
    catch (e) {
        return false;
    }
};
//# sourceMappingURL=validateDestinationAddress.js.map