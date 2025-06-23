import { AminoConverters } from "@cosmjs/stargate";
import { toBech32 } from "@cosmjs/encoding";
import { toAccAddress } from "@cosmjs/stargate/build/queryclient/utils";

import { AXELAR_PREFIX } from "../const";

import Long from "long";

export const createAxelarAminoConverters = (): AminoConverters => ({
  // nexus module
  "/axelar.nexus.v1beta1.SetTransferRateLimitRequest": {
    aminoType: "nexus/SetTransferRateLimit",
    toAmino: ({
      senderBz,
      sender,
      chain,
      limit: { amount, denom },
      window: { seconds, nanos },
    }) => ({
      sender_bz: toBech32(AXELAR_PREFIX, senderBz),
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
    toAmino: ({ senderBz, sender, chains }) => ({
      sender_bz: toBech32(AXELAR_PREFIX, senderBz),
      chains,
      sender,
    }),
    fromAmino: ({ sender_bz, sender, chains }) => ({
      senderBz: toAccAddress(sender_bz),
      chains,
      sender,
    }),
  },
  "/axelar.nexus.v1beta1.DeactivateChainRequest": {
    aminoType: "nexus/DeactivateChain",
    toAmino: ({ senderBz, sender, chains }) => ({
      sender_bz: toBech32(AXELAR_PREFIX, senderBz),
      chains,
      sender,
    }),
    fromAmino: ({ sender_bz, sender, chains }) => ({
      senderBz: toAccAddress(sender_bz),
      chains,
      sender,
    }),
  },
});
