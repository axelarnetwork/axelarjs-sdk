import { io, Socket } from "socket.io-client";
import { SocketListenerTypes } from "../chains/types";

/**
 * @deprecated The class should not be used and will soon be removed
 */
export class SocketServices {
  private socket: Socket;
  private resourceUrl: string;
  private testMode = false;

  constructor(resourceUrl: string, testMode = false) {
    this.resourceUrl = resourceUrl;
    this.testMode = testMode;
  }

  public async createSocket() {
    if (this.testMode) {
      this.socket = io(this.resourceUrl, {
        reconnectionDelay: 0,
        forceNew: true,
        transports: ["websocket"],
        extraHeaders: {
          "User-Agent":
            "Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion",
        },
      });
    } else {
      this.socket = io(this.resourceUrl, {
        transports: ["websocket"],
        reconnectionDelayMax: 10000,
        extraHeaders: {
          "User-Agent":
            "Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion",
        },
      });
    }

    return new Promise((resolve, reject) => {
      this.socket.on("connect", () => {
        resolve(true);
      });
    });
  }

  public joinRoomAndWaitForEvent(roomId: string, waitCb: any) {
    return new Promise(async (resolve) => {
      await this.createSocket();
      const ms: number = 1.8e6; //30 minutes
      const timeout = setTimeout(() => {
        waitCb({ timedOut: true });
        this.disconnect();
      }, ms);
      this.socket.emit("room:join", roomId, () => {
        this.socket.on("bridge-event", (data: any) => {
          waitCb && waitCb(data);
          clearTimeout(timeout);
          resolve(data);
          this.disconnect();
        });
      });
    });
  }

  public joinRoomAndWaitDepositConfirmationEvent(roomId: string, waitCb: any) {
    return new Promise(async (resolve) => {
      await this.createSocket();
      const ms: number = 1.8e6; //30 minutes
      const timeout = setTimeout(() => {
        waitCb({ timedOut: true });
        this.disconnect();
      }, ms);
      this.socket.emit("room:join", roomId, () => {
        this.socket.on("bridge-event", (data: any) => {
          waitCb && waitCb(data);
          resolve(data);
          clearTimeout(timeout);
          this.disconnect();
        });
      });
    });
  }

  public emitMessageAndWaitForReply(
    triggerTopic: SocketListenerTypes,
    message: any,
    waitTopic: SocketListenerTypes,
    waitCb: any
  ) {
    return new Promise(async (resolve, reject) => {
      await this.createSocket();
      this.emitMessage(triggerTopic, message);
      this.awaitResponse(waitTopic, (data: any) => {
        waitCb(data);
        resolve(data);
      });
    });
  }

  public emitMessage(topic: SocketListenerTypes, message: any): void {
    this.socket?.emit(topic, message);
  }

  public awaitResponse(topic: SocketListenerTypes, waitCb: any): void {
    this.socket?.on(topic, (data: any) => {
      waitCb && waitCb(data);
      this.disconnect();
    });
  }

  public disconnect() {
    this.socket.disconnect();
  }
}
