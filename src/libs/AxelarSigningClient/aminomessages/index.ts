import { AminoConverters } from "@cosmjs/stargate";

import Long from "long";

export const createAxelarAminoConverters = (): AminoConverters => ({
  // nexus module
  "/axelar.nexus.v1beta1.SetTransferRateLimitRequest": {
    aminoType: "nexus/SetTransferRateLimit",
    toAmino: ({ sender, chain, limit: { amount, denom }, window: { seconds, nanos } }) => ({
      chain,
      window: Long.fromValue(seconds).multiply(1000000000).add(nanos).toString(),
      limit: {
        amount,
        denom,
      },
      sender,
    }),
    fromAmino: ({ sender, chain, limit: { amount, denom }, window }) => ({
      chain,
      window: {
        seconds: Long.fromNumber(Number(window) / 1000000000),
        nanos: Number(window) % 1000000000,
      },
      limit: {
        amount,
        denom,
      },
      sender,
    }),
  },
  "/axelar.nexus.v1beta1.ActivateChainRequest": {
    aminoType: "nexus/ActivateChain",
    toAmino: ({ sender, chains }) => ({
      chains,
      sender,
    }),
    fromAmino: ({ sender, chains }) => ({
      chains,
      sender,
    }),
  },
  "/axelar.nexus.v1beta1.DeactivateChainRequest": {
    aminoType: "nexus/DeactivateChain",
    toAmino: ({ sender, chains }) => ({
      chains,
      sender,
    }),
    fromAmino: ({ sender, chains }) => ({
      chains,
      sender,
    }),
  },
});
