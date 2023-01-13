import { ethers } from "ethers";
import rpcInfo from "../constants/chain";

export function getDefaultProvider(chain: string, environment: string) {
  const { networkInfo, rpcMap } = rpcInfo[environment];
  return new ethers.providers.JsonRpcProvider(rpcMap[chain], networkInfo[chain]);
}
