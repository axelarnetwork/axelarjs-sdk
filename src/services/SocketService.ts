import { io, Socket } from "socket.io-client";

export class SocketService {
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
            "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
        },
      });
    } else {
      this.socket = io(this.resourceUrl, {
        transports: ["websocket"],
        reconnectionDelayMax: 10000,
        extraHeaders: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
        },
      });
    }

    return new Promise((resolve) => {
      this.socket.on("connect", () => {
        resolve(true);
      });
    });
  }

  public joinRoomAndWaitForEvent(roomId: string): Promise<any> {
    return new Promise(async (resolve) => {
      await this.createSocket();
      const ms = 1.8e6; //30 minutes
      const timeout = setTimeout(() => {
        this.disconnect();
      }, ms);
      this.socket.emit("room:join", roomId, () => {
        this.socket.on("bridge-event", (data: any) => {
          clearTimeout(timeout);
          resolve(data);
          this.disconnect();
        });
      });
    });
  }

  public disconnect() {
    this.socket.disconnect();
  }
}
