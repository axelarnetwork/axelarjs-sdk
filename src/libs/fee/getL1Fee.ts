/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BigNumber, ethers } from "ethers";
import { EstimateL1FeeParams } from "../types";

const ABI = {
  Optimism: ["function getL1Fee(bytes executeData) view returns (uint256)"],
  Mantle: [
    "function getL1Fee(bytes executeData) view returns (uint256)",
    "function tokenRatio() view returns (uint256)",
  ],
};

/**
 * Get the estimated L1 fee for a given L2 chain, denominated in the destination
 * chain's native token wei.
 *
 * - OP Stack chains with ETH as native (optimism, base, blast, fraxtal, scroll):
 *   returns the oracle's getL1Fee(data) result, which is already in ETH wei.
 * - Mantle (post-Arsia): returns getL1Fee(data) × tokenRatio(), which converts
 *   the oracle's ETH-wei posting cost to MNT wei — matching what Mantle actually
 *   debits from the user's balance at tx inclusion.
 * - Arbitrum: returns 0. Arbitrum bundles the L1 component into the L2 gasUsed
 *   reported by eth_estimateGas, so there's no separate L1 fee to return here.
 *
 * @param provider JSON-RPC provider for the destination chain.
 * @param params Estimation parameters, including executeData and l2Type.
 * @returns The estimated L1 fee in the destination chain's native token wei.
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
    case "mantle":
      return getMantleL1Fee(provider, {
        ...params,
        l1GasOracleAddress: _l1GasOracleAddress,
      });
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

async function getMantleL1Fee(
  provider: ethers.providers.Provider,
  estimateL1FeeParams: EstimateL1FeeParams
): Promise<BigNumber> {
  const { executeData, l1GasOracleAddress } = estimateL1FeeParams;

  const contract = new ethers.Contract(l1GasOracleAddress as string, ABI.Mantle, provider);
  const [l1FeeEthWei, tokenRatio] = await Promise.all([
    contract.getL1Fee(executeData) as Promise<BigNumber>,
    contract.tokenRatio() as Promise<BigNumber>,
  ]);

  if (tokenRatio.isZero()) {
    throw new Error(
      `Mantle L1 fee oracle at ${l1GasOracleAddress} returned tokenRatio=0; unable to compute L1 fee`
    );
  }

  // getL1Fee is ETH wei; tokenRatio is the ETH→MNT conversion factor. Product is MNT wei.
  return l1FeeEthWei.mul(tokenRatio);
}
