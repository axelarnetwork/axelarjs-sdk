import { v4 as uuidv4 } from "uuid";
import { AssetTransferObject } from "../interface";
import fetch from "cross-fetch";

export class RestServices {
  constructor(private host: string) {}

  public post(
    endpoint: string,
    payload: AssetTransferObject,
    headers?: any
  ): Promise<any> {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-traceId": payload.transactionTraceId || uuidv4(),
        publicAddress: payload.publicAddr,
        signature: payload.signature,
        otc: payload.otc,
      },
      body: JSON.stringify(payload),
    };

    return new Promise((resolve, reject) => {
      this.execRest(endpoint, requestOptions)
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  }

  public get(endpoint: string): Promise<any> {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-traceId": uuidv4(),
      },
    };

    return new Promise((resolve, reject) => {
      this.execRest(endpoint, requestOptions)
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  }

  private execRest(endpoint: string, requestOptions: any) {
    return new Promise((resolve, reject) => {
      fetch(this.host + endpoint, requestOptions)
        .then((response) => response.json())
        .then((data: any) => {
          if (data?.error) {
            reject(data);
          } else {
            console.log("RestServices response data", data);
            resolve(data);
          }
        })
        .catch((err) => {
          reject({
            message: "AxelarJS-SDK uncaught post error",
            uncaught: true,
            fullMessage: err,
          });
        });
    });
  }
}
