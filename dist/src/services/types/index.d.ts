export declare const TRANSFER_RESULT = "socket-transfer-result";
export declare const CLIENT_API_POST_TRANSFER_ASSET = "/transfer-assets";
export declare const CLIENT_API_GET_OTC = "/otc";
export declare const CLIENT_API_GET_FEE = "/chain/fee";
export interface SocketOptions {
    reconnectionDelayMax: number;
    auth: {
        token: string;
    };
    query: {
        [key: string]: string;
    };
}
export interface CallbackStatus {
    successCb: any;
    failCb: any;
}
export type StatusResponse = (...args: any[]) => void;
export type SourceOrDestination = "source" | "destination";
export interface OTC {
    otc: string;
    validationMsg: string;
}
//# sourceMappingURL=index.d.ts.map