import { BigNumber, ethers } from "ethers";
import { EstimateL1FeeParams } from "../types";
/**
 * Get the estimated L1 fee for a given L2 chain.
 * @param env The environment to use. Either "mainnet" or "testnet".
 * @param chain The destination L2 chain.
 * @param params The parameters to use for the estimation.
 * @returns The estimated L1 fee.
 */
export declare function getL1FeeForL2(provider: ethers.providers.JsonRpcProvider, params: EstimateL1FeeParams): Promise<BigNumber>;
//# sourceMappingURL=getL1Fee.d.ts.map