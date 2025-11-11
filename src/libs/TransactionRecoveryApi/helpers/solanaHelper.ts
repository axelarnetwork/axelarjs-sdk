import { PublicKey } from "@solana/web3.js";

/**
 * Helper function to validate Solana addresses using PublicKey
 * @param address - The address string to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @returns The validated PublicKey instance
 * @throws Error if the address is invalid
 */
export function validateSolanaAddress(address: string, fieldName: string): PublicKey {
  try {
    return new PublicKey(address);
  } catch (error) {
    throw new Error(
      `Invalid ${fieldName}: ${address}. ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
