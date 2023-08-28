import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

export class BigNumberUtils {
  public static multiplyToGetWei(bn: BigNumber | string, number: string, units: number): BigNumber {
    if (number.toString().split(".")[1].length <= units) {
      return BigNumber.from(bn).mul(parseUnits(number, units));
    } else {
      const multiplier = Math.pow(10, units);
      return BigNumber.from(bn)
        .mul(parseUnits((Number(number) * multiplier).toString(), units))
        .div(multiplier);
    }
  }

  public static divideToGetWei(bn: BigNumber | string, number: string, units: number): BigNumber {
    return BigNumber.from(bn).div(parseUnits(number, units));
  }
}
