import { io } from "socket.io-client";
import { SocketListenerTypes, SocketOptions } from "../interface";
import { GREPTCHA_SITE_KEY } from "../constants";

/**
 * SocketServices establishes socket connection between webapp and rest server
 */

declare const grecaptcha: any;

export class SocketServices {
  private socket: any;
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
      // transports: ['websocket'],
      reconnectionDelayMax: 10000,
      auth: { token },
      query: {},
    } as SocketOptions);

    this.socket.once("connect", (data: any) => {
      cb && cb();
    });

    this.socket.once("disconnect", (data: any) => {});
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
