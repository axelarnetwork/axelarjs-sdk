import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
  mantle,
  mantleTestnet,
  optimism,
  optimismGoerli,
  scroll,
  scrollSepolia,
} from "viem/chains";

import { TokenUnit } from "../../gmp";

export type L2Chain = "optimism" | "arbitrum" | "mantle" | "base" | "scroll";
