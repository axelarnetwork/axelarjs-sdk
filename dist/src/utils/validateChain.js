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
exports.validateChainIdentifierOld = validateChainIdentifierOld;
exports.validateChainIdentifier = validateChainIdentifier;
exports.throwIfInvalidChainIds = throwIfInvalidChainIds;
const string_similarity_js_1 = require("string-similarity-js");
const chains_1 = require("../chains");
function validateChainIdentifierOld(chainIdentifier, environment) {
    return __awaiter(this, void 0, void 0, function* () {
        const chains = yield (0, chains_1.loadChains)({
            environment,
        });
        const chainIdentifiers = chains.map((chain) => chain.chainIdentifier[environment]);
        const foundChain = chainIdentifiers.find((identifier) => identifier === chainIdentifier.toLowerCase());
        return {
            foundChain: !!foundChain,
            bestMatch: foundChain ? false : findSimilarInArray(chainIdentifiers, chainIdentifier),
        };
    });
}
function validateChainIdentifier(chainIdentifier, environment) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const s3 = yield (0, chains_1.importS3Config)(environment);
        if (!s3 || !s3.chains)
            return {
                foundChain: false,
                bestMatch: false,
            };
        const chainIdentifiers = Object.keys(s3.chains);
        const axelarIdentifier = ((_a = s3["axelar"]) === null || _a === void 0 ? void 0 : _a.axelarId) || "axelar";
        chainIdentifiers.push(axelarIdentifier);
        const foundChain = chainIdentifiers.find((identifier) => identifier === chainIdentifier.toLowerCase());
        return {
            foundChain: !!foundChain,
            bestMatch: foundChain ? false : findSimilarInArray(chainIdentifiers, chainIdentifier),
        };
    });
}
function findSimilarInArray(array, wordsToFind) {
    let bestMatch = array[0];
    let bestScore = 0;
    for (const i in array) {
        const score = (0, string_similarity_js_1.stringSimilarity)(array[i], wordsToFind);
        if (score >= bestScore) {
            bestScore = score;
            bestMatch = array[i];
        }
    }
    return bestMatch;
}
function throwIfInvalidChainIds(chains, environment) {
    return __awaiter(this, void 0, void 0, function* () {
        const validations = yield Promise.all(chains.map((chain) => validateChainIdentifier(chain, environment)));
        for (let i = 0; i < validations.length; i++) {
            if (!validations[i].foundChain) {
                throw new Error(`Invalid chain identifier for ${chains[i]}. Did you mean ${validations[i].bestMatch}?`);
            }
        }
    });
}
//# sourceMappingURL=validateChain.js.map