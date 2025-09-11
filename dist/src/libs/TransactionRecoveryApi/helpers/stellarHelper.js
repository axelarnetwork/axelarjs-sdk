"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenToScVal = tokenToScVal;
const stellar_sdk_1 = require("@stellar/stellar-sdk");
function tokenToScVal(tokenAddress, tokenAmount) {
    return (0, stellar_sdk_1.nativeToScVal)({
        address: stellar_sdk_1.Address.fromString(tokenAddress),
        amount: tokenAmount,
    }, {
        type: {
            address: ["symbol", "address"],
            amount: ["symbol", "i128"],
        },
    });
}
//# sourceMappingURL=stellarHelper.js.map