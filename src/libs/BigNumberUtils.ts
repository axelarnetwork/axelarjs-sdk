import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

export class BigNumberUtils {
  public static multiplyToGetWei(bn: BigNumber | string, number: string, units: number): BigNumber {
    return BigNumber.from(bn).mul(parseUnits(number, units));
  }

  public static divideToGetWei(bn: BigNumber | string, number: string, units: number): BigNumber {
    return BigNumber.from(bn).div(parseUnits(number, units));
  }
}
