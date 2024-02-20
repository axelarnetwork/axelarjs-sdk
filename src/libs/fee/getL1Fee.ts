/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BigNumber, ethers } from "ethers";
import { EstimateL1FeeParams } from "../types";
import { Multicall, ContractCallContext } from "ethereum-multicall";

/**
 * Get the estimated L1 fee for a given L2 chain.
 * @param env The environment to use. Either "mainnet" or "testnet".
 * @param chain The destination L2 chain.
 * @param params The parameters to use for the estimation.
 * @returns The estimated L1 fee.
 */
export function getL1FeeForL2(
  provider: ethers.providers.JsonRpcProvider,
  chain: string,
  params: EstimateL1FeeParams
): Promise<BigNumber> {
  const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });

  switch (chain) {
    // Most of the ethereum clients are already included L1 fee in the gas estimation for Arbitrum.
    case "arbitrum":
    case "arbitrum-sepolia":
      return Promise.resolve(BigNumber.from(0));
    case "optimism":
    case "scroll":
    case "base":
      return getOptimismL1Fee(multicall, params);
    case "mantle":
      return getMantleL1Fee(multicall, params);
    default:
      return Promise.resolve(BigNumber.from(0));
  }
}

async function getOptimismL1Fee(multicall: Multicall, estimateL1FeeParams: EstimateL1FeeParams) {
  const { l1GasPrice, executeData } = estimateL1FeeParams;

  const contractAddress = "0x420000000000000000000000000000000000000F";

  const contractCallContext: ContractCallContext[] = [
    {
      reference: "gasOracle",
      contractAddress,
      abi: [
        "function getL1GasUsed(bytes executeData) returns (uint256)",
        "function scalar() returns (uint256)",
        "function overhead() returns (uint256)",
      ],
      calls: [
        {
          reference: "l1GasUsed",
          methodName: "getL1GasUsed(bytes)",
          methodParameters: [executeData],
        },
        { reference: "scalar", methodName: "scalar()", methodParameters: [] },
        { reference: "overhead", methodName: "overhead()", methodParameters: [] },
      ],
    },
  ];

  const { results } = await multicall.call(contractCallContext);

  const gasUsed = BigNumber.from(results["gasOracle"].callsReturnContext[0].returnValues[0].hex);

  const overheads = results["gasOracle"].callsReturnContext.slice(1);
  const dynamicOverhead = BigNumber.from(overheads[0].returnValues[0] || 684000);
  const fixedOverhead = BigNumber.from(overheads[1].returnValues[0] || 2100);

  const totalGasUsed = gasUsed.add(fixedOverhead).mul(dynamicOverhead).div(1_000_000);
  const gasPrice = BigNumber.from(l1GasPrice.value);

  return totalGasUsed.mul(gasPrice);
}

async function getMantleL1Fee(multicall: Multicall, estimateL1FeeParams: EstimateL1FeeParams) {
  const contractAddress = "0x420000000000000000000000000000000000000F";
  const { l1GasPrice } = estimateL1FeeParams;

  const abi = ["function overhead() returns (uint256)", "function scalar() returns (uint256)"];

  const contractCallContext: ContractCallContext[] = [
    {
      reference: "gasOracle", // Common reference
      contractAddress,
      abi,
      calls: [
        { reference: "overhead", methodName: "overhead", methodParameters: [] },
        { reference: "scalar", methodName: "scalar", methodParameters: [] },
      ],
    },
  ];

  // Execute Multicall
  const { results } = await multicall.call(contractCallContext);

  // Extract results
  const [fixedOverhead, dynamicOverhead] = results.gasOracle.callsReturnContext.map(
    (call) => call.returnValues
  );

  // (fixedOverhead * dynamicOverhead) / 1_000_000n;
  const totalGasUsed = BigNumber.from(fixedOverhead)
    .mul(BigNumber.from(dynamicOverhead))
    .div(1_000_000);

  const gasPrice = BigNumber.from(l1GasPrice.value);

  return totalGasUsed.mul(gasPrice);
}
