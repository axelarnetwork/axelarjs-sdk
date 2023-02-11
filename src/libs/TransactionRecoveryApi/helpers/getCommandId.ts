import { arrayify, keccak256 } from "ethers/lib/utils";

export const getCommandId = (chainID: number, txHash: string, sourceEventIndex: number) => {
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
