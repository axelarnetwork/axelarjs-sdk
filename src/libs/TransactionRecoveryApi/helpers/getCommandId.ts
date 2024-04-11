import { arrayify, concat, hexlify, hexZeroPad, keccak256 } from "ethers/lib/utils";

const stringToCharcodeArray = (text: string) => Array.from(text, (char) => char.charCodeAt(0));

// This function should be called from evm source chain only. It doesn't work properly if it's called from cosmos-based or others chains.
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
