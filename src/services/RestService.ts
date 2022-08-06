import fetch from "cross-fetch";

export class RestService {
  constructor(private host: string) {}

  post(url: string, body: any, traceId?: string) {
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

  get(url: string, traceId?: string) {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-trace-id": traceId || "none",
      },
    };

    return this.execRest(url, requestOptions);
  }

  private async execRest(endpoint: string, requestOptions: any) {

    const response = await fetch(this.host + endpoint, requestOptions);

    if (response.ok) {
      return Promise.resolve(await response.json());
    } else {
      return Promise.reject({
        message: "AxelarJS-SDK uncaught post error",
        uncaught: true,
        fullMessage: response.statusText,
        response
      });
    }

  }
}
