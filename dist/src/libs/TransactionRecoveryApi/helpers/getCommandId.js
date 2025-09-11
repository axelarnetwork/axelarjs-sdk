"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommandId = void 0;
const utils_1 = require("ethers/lib/utils");
const stringToCharcodeArray = (text) => Array.from(text, (char) => char.charCodeAt(0));
// This function is specifically designed for use with EVM-based chains. Its behavior may not be as expected if used with Cosmos-based chains or other types of chains.
const getCommandId = (messageId, sourceEventIndex, chainId) => {
    if (messageId.includes("-")) {
        return (0, utils_1.keccak256)((0, utils_1.concat)([stringToCharcodeArray(messageId), (0, utils_1.hexlify)(chainId)]));
    }
    else {
        return (0, utils_1.keccak256)((0, utils_1.concat)([
            messageId,
            (0, utils_1.arrayify)((0, utils_1.hexZeroPad)((0, utils_1.hexlify)(sourceEventIndex), 8)).reverse(),
            (0, utils_1.hexlify)(chainId),
        ]));
    }
};
exports.getCommandId = getCommandId;
//# sourceMappingURL=getCommandId.js.map