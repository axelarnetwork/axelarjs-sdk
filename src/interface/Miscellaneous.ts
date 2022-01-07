// TODO: all miscellaneous topics go here for now

import {BlockCypherResponseCallback} from "../chains/Bitcoin/WaitingService";

export const TRANSFER_RESULT: string = "socket-transfer-result";

// POST REQUEST CONSTS
export const CLIENT_API_POST_TRANSFER_ASSET: string = "/transferAssets";

export interface SocketOptions {
	reconnectionDelayMax: number;
	auth: { token: string };
	query: { [key: string]: string }
}

export interface CallbackStatus {
	successCb: any;
	failCb: any;
}

export type StatusResponse = BlockCypherResponseCallback
	| (() => void);

export type SourceOrDestination = "source" | "destination";