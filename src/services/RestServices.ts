import fetch from "cross-fetch";
import { AssetTransferObject } from "../chains/types";

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
        publicAddress: payload.publicAddr,
        signature: payload.signature,
        // otc: payload.otc,
        ...headers,
      },
      body: JSON.stringify(payload),
    };

    return new Promise((resolve, reject) => {
      this.execRest(endpoint, requestOptions)
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  }

  public get(endpoint: string, headers?: any): Promise<any> {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
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
