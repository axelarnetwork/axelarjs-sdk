import { ethers } from "ethers";
import { EvmChain } from "src/libs/types";
import { networkInfo, rpcMap } from "../constants/chain";

export function getDefaultProvider(chain: EvmChain) {
  return new ethers.providers.JsonRpcProvider(rpcMap[chain], networkInfo[chain]);
}
