import { arrayify, keccak256 } from "ethers/lib/utils";
import { Environment } from "src/libs/types";
import rpcInfo from "../constants/chain";

export const getCommandId = (
  chainName: string,
  txHash: string,
  sourceEventIndex: number,
  environment: Environment
) => {
  const chainID: number = rpcInfo[environment].networkInfo[chainName]?.chainId;
  const seiArr = arrayify(sourceEventIndex).reverse();
  const txHashWithEventIndex = new Uint8Array([
    ...arrayify(txHash),
    ...new Uint8Array(8).map((a, i) => seiArr[i] || a),
  ]);
  const chainIdByteArray = arrayify(chainID);
  const dataToHash = new Uint8Array(txHashWithEventIndex.length + chainIdByteArray.length);
  dataToHash.set(txHashWithEventIndex, 0);
  dataToHash.set(chainIdByteArray, txHashWithEventIndex.length);
  return keccak256(dataToHash).slice(2); // remove 0x prefix
};
