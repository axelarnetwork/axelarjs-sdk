// TODO: all miscellaneous topics go here for now

import {IBlockCypherResponse} from "./btc";

export const TRANSFER_RESULT: string = "socket-transfer-result";

// POST REQUEST CONSTS
export const CLIENT_API_POST_TRANSFER_ASSET: string = "/transferAssets";

export interface ISocketOptions {
	reconnectionDelayMax: number;
	auth: { token: string };
	query: { [key: string]: string }
}

export interface ICallbackStatus {
	successCb: any;
	failCb: any;
}

export type StatusResponse = IBlockCypherResponse
	| (() => void);