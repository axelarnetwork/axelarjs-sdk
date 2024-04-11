import { arrayify, concat, hexlify, hexZeroPad, keccak256 } from "ethers/lib/utils";

const stringToCharcodeArray = (text: string) => Array.from(text, (char) => char.charCodeAt(0));

// This function is specifically designed for use with EVM-based chains. Its behavior may not be as expected if used with Cosmos-based chains or other types of chains.
export const getCommandId = (messageId: string, sourceEventIndex: number, chainId: number) => {
  if (messageId.includes("-")) {
    return keccak256(concat([stringToCharcodeArray(messageId), hexlify(chainId)]));
  } else {
    return keccak256(
      concat([
        messageId,
        arrayify(hexZeroPad(hexlify(sourceEventIndex), 8)).reverse(),
        hexlify(chainId),
      ])
    );
  }
};
