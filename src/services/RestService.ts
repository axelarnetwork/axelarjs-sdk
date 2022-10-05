import fetch from "cross-fetch";
import HttpError from "standard-http-error";

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

  async execRest(endpoint: string, requestOptions: any) {
    return fetch(this.host + endpoint, requestOptions)
      .then((response) => {
        if (!response.ok) throw response;
        return response;
      })
      .then((response) => response.json())
      .catch(async (err) => {
        let msg;
        try {
          msg = await err.json();
        } catch (_) {
          msg = await err.text();
        }
        const error = new HttpError(
          err.status,
          msg?.message || Object.keys(msg).length > 0 ? msg : err.statusText
        );
        throw error;
      });
  }
}
