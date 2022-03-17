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

  constructor(resourceUrl: string) {
    this.resourceUrl = resourceUrl;
  }

  public async connect(cb?: any) {
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
      query: {},
    });

    this.socket.once("connect", () => {
      cb && cb();
    });

    // this.socket.once("disconnect", (data: any) => {});
  }

  public joinRoomAndWaitForEvent(roomId: string, waitCb: any) {
    return new Promise((resolve) => {
      // connect to socket.io
      this.connect(() => {
        // ask server to join room
        this.socket.emit("room:join", roomId, () => {
          // listen to bridge event
          this.socket.on("bridge-event", (data: any) => {
            console.log({
              "joinRoomAndWaitForEvent socket": data,
            });
            waitCb && waitCb(data);
            resolve(data);
            // FIXME: this should only be initiated once, no need to disconnect as it's expensive
            this.disconnect();
          });
        });
      });
    });
  }

  public joinRoomAndWaitDepositConfirmationEvent(roomId: string, waitCb: any) {
    return new Promise((resolve) => {
      // connect to socket.io
      this.connect(() => {
        // ask server to join room
        this.socket.emit("room:join", roomId, () => {
          // listen to bridge event
          this.socket.on("bridge-event", (data: any) => {
            waitCb && waitCb(data);
            resolve(data);
            // FIXME: this should only be initiated once, no need to disconnect as it's expensive
            this.disconnect();
          });
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
    return new Promise((resolve, reject) => {
      this.connect(() => {
        this.emitMessage(triggerTopic, message);
        this.awaitResponse(waitTopic, (data: any) => {
          waitCb(data);
          resolve(data);
        });
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
