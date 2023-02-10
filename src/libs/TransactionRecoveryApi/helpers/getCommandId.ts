import { arrayify, keccak256 } from "ethers/lib/utils";

function newCommandID(data: Uint8Array, chainID: number): any {
  const chainIdByteArray = arrayify(chainID);
  const dataToHash = new Uint8Array(data.length + chainIdByteArray.length);
  dataToHash.set(data, 0);
  dataToHash.set(chainIdByteArray, data.length);
  return keccak256(dataToHash).slice(2); // remove 0x prefix
}

export function getCommandId(chainID: number, txHash: string, sourceEventIndex: number) {
  const eiArr = arrayify(sourceEventIndex).reverse();
  return newCommandID(
    new Uint8Array([...arrayify(txHash), ...new Uint8Array(8).map((a, i) => eiArr[i] || a)]),
    chainID
  );
}
