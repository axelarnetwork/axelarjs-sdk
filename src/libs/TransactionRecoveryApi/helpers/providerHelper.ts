import { ethers } from "ethers";
import { EvmChain } from "../../../libs";
import rpcInfo from "../constants/chain";

export function getDefaultProvider(chain: EvmChain, environment: string) {
  const { networkInfo, rpcMap} = rpcInfo[environment];
  return new ethers.providers.JsonRpcProvider(rpcMap[chain], networkInfo[chain]);
}
