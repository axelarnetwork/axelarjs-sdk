import { ethers } from "ethers";
import ganache from "ganache";
import rpcInfo from "../../TransactionRecoveryApi/constants/chain";
import { EvmChain } from "../../types";

export interface ForkOptions {
  impersonateAccounts: string[];
  defaultBalance?: number;
  blockNumber?: number;
}

export function fork(
  evmChain: EvmChain,
  options: ForkOptions = {
    impersonateAccounts: [],
    defaultBalance: 1000,
  }
) {
  const ganacheProvider = ganache.provider({
    wallet: {
      unlockedAccounts: options.impersonateAccounts,
      defaultBalance: options.defaultBalance,
    },
    fork: {
      url: rpcInfo.testnet.rpcMap[evmChain],
      blockNumber: options?.blockNumber,
    },
    chain: {
      vmErrorsOnRPCResponse: true,
    },
    logging: {
      quiet: true,
    },
  });

  return new ethers.providers.Web3Provider(ganacheProvider as any);
}
