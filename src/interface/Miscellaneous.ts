// TODO: all miscellaneous topics go here for now

export const TRANSFER_RESULT = "socket-transfer-result";

// POST REQUEST CONSTS
export const CLIENT_API_POST_TRANSFER_ASSET = "/transferAssets";
export const CLIENT_API_GET_OTC = "/getOneTimeCode";

export interface SocketOptions {
  reconnectionDelayMax: number;
  auth: { token: string };
  query: { [key: string]: string };
}

export interface CallbackStatus {
  successCb: any;
  failCb: any;
}

export type StatusResponse = (...args: any[]) => void;

export type SourceOrDestination = "source" | "destination";
