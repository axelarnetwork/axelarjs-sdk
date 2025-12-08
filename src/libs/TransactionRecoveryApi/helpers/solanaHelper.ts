import { Sha256 } from "@aws-crypto/sha256-js";
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

/**
 * Computes the Anchor instruction discriminator
 * Equivalent to:
 *   let preimage = format!("global:{}", method_name);
 *   let discriminator = &sha256(preimage.as_bytes())[0..8];
 *
 * @param methodName Anchor instruction name
 * @returns Promise<Buffer> exactly 8 bytes
 */
export async function anchorInstructionDiscriminator(methodName: string): Promise<Buffer> {
  const preimage = `global:${methodName}`;
  const encoder = new TextEncoder();
  const sha = new Sha256();
  sha.update(encoder.encode(preimage));

  const digest = await sha.digest(); // returns Uint8Array (32 bytes)
  return Buffer.from(digest.slice(0, 8)); // first 8 bytes = discriminator
}

// Borsh encoding helpers
export function encodeVariantU8(index: number): Buffer {
  if (index < 0 || index > 255) throw new Error("variant index out of range");
  return Buffer.from([index]);
}

export function encodeU32LE(value: number): Buffer {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("encodeU32LE expects a non-negative integer");
  }
  const b = Buffer.alloc(4);
  b.writeUInt32LE(value, 0);
  return b;
}

export function encodeU64LE(value: bigint | number | string): Buffer {
  const big = typeof value === "bigint" ? value : BigInt(value);
  if (big < BigInt(0)) throw new Error("encodeU64LE expects non-negative");
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(big, 0);
  return b;
}

export function encodeStringBorsh(value: string): Buffer {
  const bytes = Buffer.from(value, "utf8");
  return Buffer.concat([encodeU32LE(bytes.length), bytes]);
}
