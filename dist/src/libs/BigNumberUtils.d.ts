import { BigNumber } from "ethers";
export declare class BigNumberUtils {
    static multiplyToGetWei(bn: BigNumber | string, number: string, units: number): BigNumber;
    static divideToGetWei(bn: BigNumber | string, number: string, units: number): BigNumber;
    static convertTokenAmount(ethAmount: BigNumber, sourceDecimals: number, targetDecimals: number): BigNumber;
}
//# sourceMappingURL=BigNumberUtils.d.ts.map