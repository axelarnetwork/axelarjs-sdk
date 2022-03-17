import { AssetInfo } from "../assets/types";
import { loadChains } from "../chains";
import {
  BlockchainWaitingServiceFinder,
  Chain,
  ChainInfo,
  BlockchainWaitingService,
} from "../chains/types";
import { SourceOrDestination } from "../services/types";

type IGetWaitingService = (
  chainInfo: ChainInfo,
  assetInfo: AssetInfo,
  sOrDChain: SourceOrDestination,
  environment: string
) => BlockchainWaitingService | Promise<BlockchainWaitingService>;

export const getWaitingService: IGetWaitingService = (
  chainInfo: ChainInfo,
  assetInfo: AssetInfo,
  sOrDChain: SourceOrDestination,
  environment: string
) => {
  const waitingServiceMap: {
    [chainKey: string]: BlockchainWaitingServiceFinder;
  } = {};

  const chains = loadChains({
    environment,
  });

  chains.forEach((chainInfo: Chain) => {
    const chainKey: string = chainInfo.chainInfo.chainSymbol.toLowerCase();
    waitingServiceMap[chainKey] =
      chainInfo.waitingService as BlockchainWaitingServiceFinder;
  });

  const chainKey = chainInfo.chainSymbol.toLowerCase();
  return waitingServiceMap[chainKey](
    chainInfo,
    assetInfo,
    sOrDChain,
    environment
  );
};
