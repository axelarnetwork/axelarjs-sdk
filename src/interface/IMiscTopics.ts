// TODO: all miscellaneous topics go here for now

export const TRANSFER_RESULT: string = "socket-transfer-result";

// POST REQUEST CONSTS
export const CLIENT_API_POST_TRANSFER_ASSET: string = "/transferAssets";

export interface ITokenAddress {
	tokenAddress: string | null;
	tokenSymbol: string | null;
}