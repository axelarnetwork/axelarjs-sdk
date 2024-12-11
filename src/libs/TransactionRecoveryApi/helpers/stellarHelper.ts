import { nativeToScVal, Address } from "@stellar/stellar-sdk";

export function tokenToScVal(tokenAddress: string, tokenAmount: string) {
  return nativeToScVal(
    {
      address: Address.fromString(tokenAddress),
      amount: tokenAmount,
    },
    {
      type: {
        address: ["symbol", "address"],
        amount: ["symbol", "i128"],
      },
    }
  );
}
