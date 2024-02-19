export enum L2Chain {
  ARBITRUM = "arbitrum",
  ARBITRUM_SEPOLIA = "arbitrum-sepolia",
  BASE = "base",
  OPTIMISM = "optimism",
  MANTLE = "mantle",
  SCROLL = "scroll",
}

export const L2_CHAINS = Object.values(L2Chain) as string[];
