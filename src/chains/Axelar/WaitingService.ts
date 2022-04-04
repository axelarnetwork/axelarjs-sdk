import { BaseWaitingService } from "../models/BaseWaitingService";
import { SocketService } from "../../services/SocketService";
import { AssetInfo } from "../../assets/types";
import { StatusResponse } from "../../services/types";
import {
  BlockchainWaitingService,
  ChainInfo,
  AssetAndChainInfo,
} from "../types";

export default class WaitingService
  extends BaseWaitingService
  implements BlockchainWaitingService
{
  constructor(chainInfo: ChainInfo, assetInfo: AssetInfo) {
    super(1, assetInfo.assetAddress as string);
  }

  public async waitForLinkEvent(
    roomId: string,
    interimStatusCb: StatusResponse,
    clientSocketConnect: SocketService
  ) {
    return this.waitForEvent(roomId, interimStatusCb, clientSocketConnect);
  }

  public async waitForDepositConfirmation(
    roomId: string,
    interimStatusCb: StatusResponse,
    clientSocketConnect: SocketService
  ) {
    return this.waitForEvent(roomId, interimStatusCb, clientSocketConnect);
  }

  public async waitForTransferEvent(
    assetAndChainInfo: AssetAndChainInfo,
    interimStatusCb: StatusResponse,
    clientSocketConnect: SocketService,
    roomId: string
  ) {
    return this.waitForEvent(
      roomId as string,
      interimStatusCb,
      clientSocketConnect
    );
  }
}
