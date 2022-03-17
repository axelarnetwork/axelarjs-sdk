import { AssetInfo } from "../assets/types";
import { ChainList } from "../chains";
import {
  BlockchainWaitingServiceFinder,
  Chain,
  ChainInfo,
  BlockchainWaitingService,
} from "../chains/types";
import { SourceOrDestination } from "../services/types";

const waitingServiceMap: {
  [chainKey: string]: BlockchainWaitingServiceFinder;
} = {};

ChainList.forEach((chainInfo: Chain) => {
  const chainKey: string = chainInfo.chainInfo.chainSymbol.toLowerCase();
  waitingServiceMap[chainKey] =
    chainInfo.waitingService as BlockchainWaitingServiceFinder;
});

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
  const chainKey = chainInfo.chainSymbol.toLowerCase();
  return waitingServiceMap[chainKey](
    chainInfo,
    assetInfo,
    sOrDChain,
    environment
  );
};
