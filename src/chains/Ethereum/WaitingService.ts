import { AssetInfo } from "../../assets/types";
import { StatusResponse } from "../../services/types";
import {
  BlockchainWaitingService,
  ChainInfo,
  AssetAndChainInfo,
} from "../types";
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

  public async waitForLinkEvent(
    roomId: string,
    interimStatusCb: StatusResponse,
    clientSocketConnect: SocketServices
  ) {
    return this.waitForEvent(roomId, interimStatusCb, clientSocketConnect);
  }

  public async waitForDepositConfirmation(
    roomId: string,
    interimStatusCb: StatusResponse,
    clientSocketConnect: SocketServices
  ) {
    return this.waitForDepositConfirmationEvent(
      roomId,
      interimStatusCb,
      clientSocketConnect
    );
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
