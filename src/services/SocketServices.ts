import { reject } from "lodash";
import { io, Socket } from "socket.io-client";
import { SocketListenerTypes } from "../chains/types";
import { GREPTCHA_SITE_KEY } from "../constants";

/**
 * SocketServices establishes socket connection between webapp and rest server
 */
declare const grecaptcha: any;

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
      });
    } else {
      if (!grecaptcha) {
        console.log("need valid captcha first");
        return;
      }

      let token: any;

      try {
        token = await grecaptcha.execute(GREPTCHA_SITE_KEY, {
          action: "submit_from_sdk",
        });
      } catch (e: any) {
        console.log("cannot get captcha", e);
        return;
      }

      this.socket = io(this.resourceUrl, {
        transports: ["websocket"],
        reconnectionDelayMax: 10000,
        auth: { token },
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

      this.socket.emit("room:join", roomId, () => {
        this.socket.on("bridge-event", (data: any) => {
          waitCb && waitCb(data);
          resolve(data);
          this.disconnect();
        });
      });
    });
  }

  public joinRoomAndWaitDepositConfirmationEvent(roomId: string, waitCb: any) {
    return new Promise(async (resolve) => {
      await this.createSocket();
      this.socket.emit("room:join", roomId, () => {
        this.socket.on("bridge-event", (data: any) => {
          waitCb && waitCb(data);
          resolve(data);
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
