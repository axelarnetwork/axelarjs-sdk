import WaitingService from "./WaitingService";
import { isAddress as isValidEVMAddress } from "ethers/lib/utils";
import { AssetInfo } from "../../assets/types";
import { SourceOrDestination } from "../../services/types";
import { Chain, ChainInfo, BlockchainWaitingServiceFinder } from "../types";
import { ProviderType } from "../../utils/EthersJs/ethersjsProvider";

export default class Ethereum implements Chain {
  public providerType: ProviderType;

  public chainInfo: ChainInfo = {
    chainSymbol: "ETH",
    chainName: "Ethereum",
    estimatedWaitTime: 15,
    fullySupported: true,
    assets: [],
    txFeeInPercent: 0.1,
    module: "evm",
    confirmLevel: 40,
    chainIdentifier: {
      devnet: "ethereum",
      testnet: "ethereum",
      mainnet: "ethereum",
    },
  };

  constructor() {
    this.providerType = "ethereum";
  }

  public validateAddress = (addressInfo: AssetInfo) =>
    isValidEVMAddress(addressInfo.assetAddress as string);

  public waitingService: BlockchainWaitingServiceFinder = async (
    chainInfo: ChainInfo,
    assetInfo: AssetInfo,
    sOrDChain: SourceOrDestination,
    environment: string
  ) => {
    return new WaitingService(
      chainInfo,
      assetInfo,
      environment,
      this.providerType
    );
  };
}
