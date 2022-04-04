import {
  BlockchainWaitingService,
  AssetAndChainInfo,
  SocketListenerTypes,
} from "../types";
import { StatusResponse } from "../../services/types";
import { SocketService } from "../../services/SocketService";

export class BaseWaitingService implements BlockchainWaitingService {
  public numConfirmations = 0;
  public depositAddress = "";
  public environment = "";

  public constructor(numConfirmations: number, depositAddress: string) {
    this.setNumConfirmations(numConfirmations);
    this.setDepositAddress(depositAddress);

    if (this.constructor == BaseWaitingService) {
      throw new Error("abstract class only.");
    }
  }

  async waitForEvent(
    roomId: string,
    interimStatusCb: StatusResponse,
    clientSocketConnect: SocketService
  ) {
    return clientSocketConnect.joinRoomAndWaitForEvent(
      roomId,
      ((data: any) => {
        data.axelarRequiredNumConfirmations = this.numConfirmations;
        interimStatusCb(data);
      }).bind(this)
    );
  }

  async waitForDepositConfirmationEvent(
    roomId: string,
    interimStatusCb: StatusResponse,
    clientSocketConnect: SocketService
  ) {
    return clientSocketConnect.joinRoomAndWaitDepositConfirmationEvent(
      roomId,
      ((data: any) => {
        data.axelarRequiredNumConfirmations = this.numConfirmations;
        interimStatusCb(data);
      }).bind(this)
    );
  }

  public async wait(
    assetAndChainInfo: AssetAndChainInfo,
    interimStatusCb: StatusResponse,
    clientSocketConnect: SocketService
  ) {
    const data: any = await clientSocketConnect.emitMessageAndWaitForReply(
      SocketListenerTypes.WAIT_FOR_DEPOSIT,
      assetAndChainInfo,
      SocketListenerTypes.DEPOSIT_CONFIRMED,
      ((data: any) => {
        data.axelarRequiredNumConfirmations = this.numConfirmations;
        interimStatusCb(data);
      }).bind(this)
    );
    return data;
  }

  public async waitForLinkEvent(...args: any[]): Promise<any> {
    throw new Error("Method 'wait()' should be implemented.");
  }

  public async waitForDepositConfirmation(...args: any[]): Promise<any> {
    throw new Error("Method 'wait()' should be implemented.");
  }

  public async waitForTransferEvent(...args: any[]): Promise<any> {
    throw new Error("Method 'wait()' should be implemented.");
  }

  private setNumConfirmations(numConfirmations: number) {
    this.numConfirmations = numConfirmations;
  }

  private setDepositAddress(depositAddress: string) {
    this.depositAddress = depositAddress;
  }
}
