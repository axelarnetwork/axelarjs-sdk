"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAxelarAminoConverters = void 0;
const long_1 = __importDefault(require("long"));
const createAxelarAminoConverters = () => ({
    // nexus module
    "/axelar.nexus.v1beta1.SetTransferRateLimitRequest": {
        aminoType: "nexus/SetTransferRateLimit",
        toAmino: ({ sender, chain, limit: { amount, denom }, window: { seconds, nanos } }) => ({
            chain,
            window: long_1.default.fromValue(seconds).multiply(1000000000).add(nanos).toString(),
            limit: {
                amount,
                denom,
            },
            sender,
        }),
        fromAmino: ({ sender, chain, limit: { amount, denom }, window }) => ({
            chain,
            window: {
                seconds: long_1.default.fromNumber(Number(window) / 1000000000),
                nanos: Number(window) % 1000000000,
            },
            limit: {
                amount,
                denom,
            },
            sender,
        }),
    },
    "/axelar.nexus.v1beta1.ActivateChainRequest": {
        aminoType: "nexus/ActivateChain",
        toAmino: ({ sender, chains }) => ({
            chains,
            sender,
        }),
        fromAmino: ({ sender, chains }) => ({
            chains,
            sender,
        }),
    },
    "/axelar.nexus.v1beta1.DeactivateChainRequest": {
        aminoType: "nexus/DeactivateChain",
        toAmino: ({ sender, chains }) => ({
            chains,
            sender,
        }),
        fromAmino: ({ sender, chains }) => ({
            chains,
            sender,
        }),
    },
});
exports.createAxelarAminoConverters = createAxelarAminoConverters;
//# sourceMappingURL=index.js.map