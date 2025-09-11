import { ethers } from "ethers";
import { EvmChain } from "../../../constants/EvmChain";
export interface ForkOptions {
    impersonateAccounts: string[];
    defaultBalance?: number;
    blockNumber?: number;
}
export declare function fork(evmChain: EvmChain, options?: ForkOptions): ethers.providers.Web3Provider;
//# sourceMappingURL=localChain.d.ts.map