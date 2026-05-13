import { PublicKey } from "@solana/web3.js";
import { arrayify, sha256, toUtf8Bytes } from "ethers/lib/utils";

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
 * @returns exactly 8 bytes
 */
export function anchorInstructionDiscriminator(methodName: string): Buffer {
  const digest = arrayify(sha256(toUtf8Bytes(`global:${methodName}`))); // 32 bytes
  return Buffer.from(digest.slice(0, 8)); // first 8 bytes = discriminator
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
  return concatU8([encodeU32LE(bytes.length), bytes]);
}

// Buffer.concat's typing is finicky across @types/node versions: a Buffer<ArrayBufferLike>[]
// is not always accepted as Uint8Array<ArrayBufferLike>[] due to Symbol.dispose differences.
// Centralize the cast here so call sites stay clean.
export function concatU8(parts: ReadonlyArray<Buffer>): Buffer {
  return Buffer.concat(parts as unknown as Uint8Array[]);
}
