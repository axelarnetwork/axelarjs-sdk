import { L2_CHAINS } from "../constants/L2Chain";

export function isL2Chain(chain: string): boolean {
  return L2_CHAINS.includes(chain);
}
