/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BigNumber, ethers } from "ethers";
import { EstimateL1FeeParams } from "../types";

const ABI = {
  Optimism: [
    // "function getL1GasUsed(bytes executeData) view returns (uint256)",
    "function getL1Fee(bytes executeData) view returns (uint256)",
  ],
  Mantle: [
    "function overhead() view returns (uint256)",
    "function scalar() view returns (uint256)",
  ],
};

export type ContractCallContext = {
  reference: string;
  contractAddress: string;
  abi: any;
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
    case "mantle":
      return getMantleL1Fee(provider, {
        ...params,
        l1GasOracleAddress: _l1GasOracleAddress,
      });
    case "op":
      return getOptimismL1Fee(provider, {
        ...params,
        l1GasOracleAddress: _l1GasOracleAddress,
      });
    // Most of the ethereum clients are already included L1 fee in the gas estimation for Arbitrum.
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

  const callContext = buildContractCallContext("optimism", l1GasOracleAddress as string);

  const contract = new ethers.Contract(callContext.contractAddress, callContext.abi, provider);
  return contract.getL1Fee(executeData);
}

async function getMantleL1Fee(
  provider: ethers.providers.Provider,
  estimateL1FeeParams: EstimateL1FeeParams
) {
  const { l1GasPrice, l1GasOracleAddress } = estimateL1FeeParams;

  const callContext = buildContractCallContext("mantle", l1GasOracleAddress as string);

  const contract = new ethers.Contract(callContext.contractAddress, callContext.abi, provider);
  const fixedOverhead = await contract.overhead();

  return BigNumber.from(l1GasPrice.value).mul(fixedOverhead || 2100);
}

type L1FeeCalculationType = "optimism" | "mantle";

function buildContractCallContext(
  type: L1FeeCalculationType,
  l1GasOracleAddress: string
): ContractCallContext {
  if (type === "optimism") {
    return {
      reference: "gasOracle",
      contractAddress: l1GasOracleAddress,
      abi: ABI.Optimism,
    };
  } else if (type === "mantle") {
    return {
      reference: "gasOracle",
      contractAddress: l1GasOracleAddress,
      abi: ABI.Mantle,
    };
  }

  throw new Error("Invalid contract call type");
}
