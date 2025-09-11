"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigNumberUtils = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
class BigNumberUtils {
    static multiplyToGetWei(bn, number, units) {
        if (number.toString().split(".")[1].length <= units) {
            return ethers_1.BigNumber.from(bn).mul((0, utils_1.parseUnits)(number, units));
        }
        else {
            const multiplier = Math.pow(10, units);
            return ethers_1.BigNumber.from(bn)
                .mul((0, utils_1.parseUnits)((Number(number) * multiplier).toFixed(units), units))
                .div(multiplier);
        }
    }
    static divideToGetWei(bn, number, units) {
        return ethers_1.BigNumber.from(bn).div((0, utils_1.parseUnits)(number, units));
    }
    static convertTokenAmount(ethAmount, sourceDecimals, targetDecimals) {
        return ethAmount.mul((0, utils_1.parseUnits)("1", targetDecimals)).div((0, utils_1.parseUnits)("1", sourceDecimals));
    }
}
exports.BigNumberUtils = BigNumberUtils;
//# sourceMappingURL=BigNumberUtils.js.map