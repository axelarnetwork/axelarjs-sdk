/* eslint-disable @typescript-eslint/no-unsafe-return */

import { BigNumber, ethers } from "ethers";
import { EstimateL1FeeParams } from "../types";
import { Multicall, ContractCallContext } from "ethereum-multicall";

/**
 * Get the estimated L1 fee for a given L2 chain.
 * @param env The environment to use. Either "mainnet" or "testnet".
 * @param chain The destination L2 chain.
 * @param params The parameters to use for the estimation.
 * @returns
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

  const [gasUsed, _dynamicOverhead, _fixedOverhead] = results["gasOracle"].callsReturnContext.map(
    (call) => BigNumber.from(call.returnValues[0].hex)
  );

  const dynamicOverhead = BigNumber.from(_dynamicOverhead || 684000);
  const fixedOverhead = BigNumber.from(_fixedOverhead || 2100);

  const totalGasUsed = gasUsed.add(fixedOverhead).mul(dynamicOverhead).div(1_000_000);
  const gasPrice = BigNumber.from(l1GasPrice.value);

  return totalGasUsed.mul(gasPrice);
}

// TODO: Not used for now because the gas estimation is already included the L1 fee by default.
// async function getArbitrumL1Fee(
//   publicClient: PublicClient,
//   destinationContractAddress: string,
//   executeData: string
// ) {
//   // Arbitrum NodeInterface contract address
//   const contractAddress = "0x00000000000000000000000000000000000000C8";

//   // https://github.com/OffchainLabs/nitro-contracts/blob/0a149d2af9aee566c4abf493479ec15e5fc32d98/src/node-interface/NodeInterface.sol#L112
//   const abi = parseAbi([
//     "function gasEstimateL1Component(address to, bool contractCreation, bytes calldata data) external payable returns (uint64,uint256,uint256)",
//   ]);

//   const fee = (await publicClient.readContract({
//     address: contractAddress,
//     abi,
//     functionName: "gasEstimateL1Component" as never,
//     args: [destinationContractAddress, false, executeData],
//   })) as [bigint, bigint, bigint];

//   return fee[0];
// }

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
    (call) => call.returnValues[0]
  );

  // (fixedOverhead * dynamicOverhead) / 1_000_000n;
  const totalGasUsed = BigNumber.from(fixedOverhead)
    .mul(BigNumber.from(dynamicOverhead))
    .div(1_000_000);

  const gasPrice = BigNumber.from(l1GasPrice.value);

  return totalGasUsed.mul(gasPrice);
}
