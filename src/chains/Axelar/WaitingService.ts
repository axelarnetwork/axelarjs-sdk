import {
  AssetAndChainInfo,
  AssetInfo,
  BlockchainWaitingService,
  ChainInfo,
  StatusResponse,
} from "../../interface";
import { BaseWaitingService } from "../models/BaseWaitingService";
import { SocketServices } from "../../services/SocketServices";

export default class WaitingService
  extends BaseWaitingService
  implements BlockchainWaitingService
{
  constructor(chainInfo: ChainInfo, assetInfo: AssetInfo) {
    super(1, assetInfo.assetAddress as string);
  }

  public async waitForDepositConfirmation(
    roomId: string,
    interimStatusCb: StatusResponse,
    clientSocketConnect: SocketServices
  ) {
    return this.waitForEvent(roomId, interimStatusCb, clientSocketConnect);
  }

  public async waitForTransferEvent(
    assetAndChainInfo: AssetAndChainInfo,
    interimStatusCb: StatusResponse,
    clientSocketConnect: SocketServices
  ) {
    return this.wait(assetAndChainInfo, interimStatusCb, clientSocketConnect);
  }
}
