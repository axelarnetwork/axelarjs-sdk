import { webcrypto } from "crypto";

if (!globalThis.crypto?.getRandomValues) {
  globalThis.crypto = webcrypto as Crypto;
}
