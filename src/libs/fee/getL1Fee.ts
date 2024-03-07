/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BigNumber, ethers } from "ethers";
import { EstimateL1FeeParams } from "../types";
import { Multicall, ContractCallContext, ContractCallResults } from "ethereum-multicall";

const ABI = {
  Optimism: [
    "function getL1GasUsed(bytes executeData) returns (uint256)",
    "function scalar() returns (uint256)",
    "function overhead() returns (uint256)",
  ],
  Mantle: ["function overhead() returns (uint256)", "function scalar() returns (uint256)"],
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
  const multicall = new Multicall({ ethersProvider: provider, tryAggregate: true });

  switch (params.l2Type) {
    case "mantle":
      return getMantleL1Fee(multicall, params);
    case "op":
      return getOptimismL1Fee(multicall, params);
    // Most of the ethereum clients are already included L1 fee in the gas estimation for Arbitrum.
    case "arb":
    default:
      return Promise.resolve(BigNumber.from(0));
  }
}

async function getOptimismL1Fee(multicall: Multicall, estimateL1FeeParams: EstimateL1FeeParams) {
  const { l1GasPrice, executeData } = estimateL1FeeParams;
  const results = await multicall.call(buildContractCallContext("optimism", executeData));
  const { gasUsed, fixedOverhead, dynamicOverhead } = extractMulticallResults("optimism", results);
  return calculateL1Fee(gasUsed, fixedOverhead, dynamicOverhead, BigNumber.from(l1GasPrice.value));
}

async function getMantleL1Fee(multicall: Multicall, estimateL1FeeParams: EstimateL1FeeParams) {
  const { l1GasPrice, executeData } = estimateL1FeeParams;
  const results = await multicall.call(buildContractCallContext("mantle", executeData));
  const { gasUsed, fixedOverhead, dynamicOverhead } = extractMulticallResults("mantle", results);
  return calculateL1Fee(gasUsed, fixedOverhead, dynamicOverhead, BigNumber.from(l1GasPrice.value));
}

function extractMulticallResults(
  type: L1FeeCalculationType,
  contractCallResults: ContractCallResults
) {
  const { results } = contractCallResults;

  if (type === "optimism") {
    const returnContexts = results["gasOracle"].callsReturnContext;
    const gasUsed = BigNumber.from(returnContexts[0].returnValues[0].hex);
    const dynamicOverhead = BigNumber.from(returnContexts[1].returnValues[0] || 684000);
    const fixedOverhead = BigNumber.from(returnContexts[2].returnValues[0] || 2100);

    return { gasUsed, fixedOverhead, dynamicOverhead };
  } else if (type === "mantle") {
    const [fixedOverhead, dynamicOverhead] = results.gasOracle.callsReturnContext.map(
      (call) => call.returnValues
    );

    return {
      gasUsed: BigNumber.from(0),
      fixedOverhead: BigNumber.from(fixedOverhead),
      dynamicOverhead: BigNumber.from(dynamicOverhead),
    };
  }

  throw new Error("Invalid type");
}

type L1FeeCalculationType = "optimism" | "mantle";

function calculateL1Fee(
  gasUsed: BigNumber,
  fixedOverhead: BigNumber,
  dynamicOverhead: BigNumber,
  gasPrice: BigNumber
) {
  const totalGas = gasUsed.add(fixedOverhead).mul(dynamicOverhead).div(1_000_000);
  return totalGas.mul(gasPrice);
}

function buildContractCallContext(
  type: L1FeeCalculationType,
  executeData: string
): ContractCallContext[] {
  const contractAddress = "0x420000000000000000000000000000000000000F";
  if (type === "optimism") {
    return [
      {
        reference: "gasOracle",
        contractAddress,
        abi: ABI.Optimism,
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
  } else if (type === "mantle") {
    return [
      {
        reference: "gasOracle",
        contractAddress,
        abi: ABI.Mantle,
        calls: [
          { reference: "overhead", methodName: "overhead", methodParameters: [] },
          { reference: "scalar", methodName: "scalar", methodParameters: [] },
        ],
      },
    ];
  }

  throw new Error("Invalid contract call type");
}
