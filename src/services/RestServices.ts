import fetch from "cross-fetch";
import { AssetTransferObject } from "../chains/types";

export class RestServices {
  constructor(private host: string) {}

  post_v2(url: string, body: any, traceId?: string): Promise<any> {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-trace-id": traceId || "none",
      },
      body: JSON.stringify(body),
    };

    return this.execRest(url, requestOptions);
  }

  get_v2(url: string, traceId?: string): Promise<any> {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-trace-id": traceId || "none",
      },
    };

    return this.execRest(url, requestOptions);
  }

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

  private async execRest(endpoint: string, requestOptions: any) {
    return fetch(this.host + endpoint, requestOptions)
      .then((response) => {
        if (!response.ok) throw response;
        return response;
      })
      .then((response) => response.json())
      .catch(async (err) => {
        const _err = await err.json();
        throw {
          message: "AxelarJS-SDK uncaught post error",
          uncaught: true,
          fullMessage: _err.message,
        };
      });
  }
}
