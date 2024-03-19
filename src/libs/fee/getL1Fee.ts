/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BigNumber, ethers } from "ethers";
import { EstimateL1FeeParams } from "../types";

const ABI = {
  Optimism: ["function getL1Fee(bytes executeData) view returns (uint256)"],
};

/**
 * Get the estimated L1 fee for a given L2 chain.
 * @param env The environment to use. Either "mainnet" or "testnet".
 * @param chain The destination L2 chain.
 * @param params The parameters to use for the estimation.
 * @returns The estimated L1 fee.
 */
export function getL1FeeForL2(
  provider: ethers.providers.JsonRpcProvider,
  params: EstimateL1FeeParams
): Promise<BigNumber> {
  const { l1GasOracleAddress } = params;

  const _l1GasOracleAddress = l1GasOracleAddress || "0x420000000000000000000000000000000000000F";

  switch (params.l2Type) {
    case "op":
      return getOptimismL1Fee(provider, {
        ...params,
        l1GasOracleAddress: _l1GasOracleAddress,
      });
    // RPC clients for Arbitrum and Mantle include both L1 and L2 components in gasLimit.
    case "mantle":
    case "arb":
    default:
      return Promise.resolve(BigNumber.from(0));
  }
}

async function getOptimismL1Fee(
  provider: ethers.providers.Provider,
  estimateL1FeeParams: EstimateL1FeeParams
) {
  const { executeData, l1GasOracleAddress } = estimateL1FeeParams;

  const contract = new ethers.Contract(l1GasOracleAddress as string, ABI.Optimism, provider);
  return contract.getL1Fee(executeData);
}
