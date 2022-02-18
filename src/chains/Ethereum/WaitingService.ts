import {
  AssetAndChainInfo,
  AssetInfo,
  BlockchainWaitingService,
  ChainInfo,
  StatusResponse,
} from "../../interface";
import { BaseWaitingService } from "../models/BaseWaitingService";
import { SocketServices } from "../../services/SocketServices";
import EthersJsWaitingService from "../../utils/EthersJs/EthersJsWaitingService";
import { ProviderType } from "../../utils/EthersJs/ethersjsProvider";

export default class WaitingService
  extends BaseWaitingService
  implements BlockchainWaitingService
{
  public environment: string;
  public providerType: ProviderType;

  constructor(
    chainInfo: ChainInfo,
    assetInfo: AssetInfo,
    environment: string,
    providerType: ProviderType
  ) {
    super(1, assetInfo.assetAddress as string);
    this.environment = environment;
    this.providerType = providerType;
  }

  public async waitForDepositConfirmation(
    assetAndChainInfo: AssetAndChainInfo,
    interimStatusCb: StatusResponse,
    clientSocketConnect: SocketServices
  ) {
    return this.wait(assetAndChainInfo, interimStatusCb, clientSocketConnect);
  }

  public async waitForTransferEvent(
    assetAndChainInfo: AssetAndChainInfo,
    interimStatusCb: StatusResponse,
    clientSocketConnect: SocketServices
  ) {
    const { assetInfo, destinationChainInfo } = assetAndChainInfo;

    return (
      await new EthersJsWaitingService(destinationChainInfo, assetInfo).build(
        destinationChainInfo,
        assetInfo,
        this.environment,
        this.providerType
      )
    ).wait(assetAndChainInfo, interimStatusCb, clientSocketConnect);
  }
}
