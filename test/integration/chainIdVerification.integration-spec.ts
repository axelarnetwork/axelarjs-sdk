import { ethers } from "ethers";
import { describe, it, expect } from "vitest";
import { Network } from "@ethersproject/networks";
import {
  rpcMap as testnetRpcMap,
  networkInfo as testnetNetworkInfo,
} from "../../src/libs/TransactionRecoveryApi/constants/chain/testnet";
import {
  rpcMap as mainnetRpcMap,
  networkInfo as mainnetNetworkInfo,
} from "../../src/libs/TransactionRecoveryApi/constants/chain/mainnet";

type RpcMap = Record<string, string> | Partial<Record<string, string>>;
type NetworkMap = Record<string, Network> | Partial<Record<string, Network>>;

const verifyChainIds = ({
  rpcMap,
  networkInfo,
  environment,
}: {
  rpcMap: RpcMap;
  networkInfo: NetworkMap;
  environment: string;
}) => {
  Object.entries(rpcMap).forEach(([chain, rpcUrl]) => {
    if (!rpcUrl) return;

    const expectedNetworkInfo = networkInfo[chain as keyof typeof networkInfo];

    if (!expectedNetworkInfo) {
      it.skip(`${chain} - Network info not found in ${environment}NetworkInfo`, () => {});
      return;
    }

    it(`${chain} should return chain ID ${expectedNetworkInfo.chainId}`, async () => {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      try {
        const network = await provider.getNetwork();
        expect(network.chainId).toBe(expectedNetworkInfo.chainId);
      } catch (error: any) {
        throw new Error(
          `RPC connection failed for ${chain} using node "${rpcUrl}": ${error?.message || error}`
        );
      }
    }, 10000);
  });
};

describe("Chain ID Verification", () => {
  describe("Testnet RPC endpoints", () => {
    verifyChainIds({
      rpcMap: testnetRpcMap,
      networkInfo: testnetNetworkInfo,
      environment: "testnet",
    });
  });

  describe("Mainnet RPC endpoints", () => {
    verifyChainIds({
      rpcMap: mainnetRpcMap,
      networkInfo: mainnetNetworkInfo,
      environment: "mainnet",
    });
  });
});
