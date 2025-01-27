import { AminoConverters } from "@cosmjs/stargate";
import { toBech32 } from "@cosmjs/encoding";
import { toAccAddress } from "@cosmjs/stargate/build/queryclient/utils";

import { AXELAR_PREFIX } from "../const";

import Long from "long";

export const createAxelarAminoConverters = (): AminoConverters => ({

    // nexus module
    "/axelar.nexus.v1beta1.SetTransferRateLimitRequest": {
      aminoType: "nexus/SetTransferRateLimit",
      toAmino: ({ sender, chain, limit: { amount, denom }, window: { seconds, nanos } }) => ({
        sender: toBech32(AXELAR_PREFIX, sender),
        chain,
        window: Long.fromValue(seconds).multiply(1000000000).add(nanos).toString(),
        limit: {
          amount,
          denom,
        },
  
      }),
      fromAmino: ({ sender, chain, limit: { amount, denom }, window }) => ({
        sender: toAccAddress(sender),
        chain,
        window: {
          seconds: Long.fromNumber(Number(window) / (1000000000)),
          nanos: Number(window) % (1000000000),
        },
  
        limit: {
          amount,
          denom,
        },
      }),
    },
    "/axelar.nexus.v1beta1.ActivateChainRequest": {
      aminoType: "nexus/ActivateChain",
      toAmino: ({ sender, chains }) => ({
        sender: toBech32(AXELAR_PREFIX, sender),
        chains,
  
      }),
      fromAmino: ({ sender, chains }) => ({
        sender: toAccAddress(sender),
        chains,
      }),
    },
    "/axelar.nexus.v1beta1.DeactivateChainRequest": {
      aminoType: "nexus/DeactivateChain",
      toAmino: ({ sender, chains }) => ({
        sender: toBech32(AXELAR_PREFIX, sender),
        chains,
  
      }),
      fromAmino: ({ sender, chains }) => ({
        sender: toAccAddress(sender),
        chains,
      }),
    },
  });