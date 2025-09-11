import { RestService } from "../../services";
import { AxelarSigningClientConfig } from "../types";
import { SigningStargateClientOptions, SigningStargateClient, DeliverTxResponse, StdFee, SignerData } from "@cosmjs/stargate";
import { EncodeObject, OfflineSigner } from "@cosmjs/proto-signing";
import { CometClient } from "@cosmjs/tendermint-rpc";
interface IAxelarSigningClient extends SigningStargateClient {
    signThenBroadcast(messages: readonly EncodeObject[], fee: number | StdFee | "auto", memo?: string): Promise<DeliverTxResponse>;
    signAndGetTxBytes(messages: readonly EncodeObject[], fee: StdFee, memo: string, explicitSignerData?: SignerData): Promise<Uint8Array>;
}
export declare class AxelarSigningClient extends SigningStargateClient implements IAxelarSigningClient {
    readonly rpcApi: RestService;
    readonly axelarRpcUrl: string;
    readonly signerAddress: string;
    protected signerClient: SigningStargateClient;
    constructor(tendermintClient: CometClient, signer: OfflineSigner, signerAddress: string, options: SigningStargateClientOptions);
    static initOrGetAxelarSigningClient(config: AxelarSigningClientConfig): Promise<AxelarSigningClient>;
    signThenBroadcast(messages: readonly EncodeObject[], fee: number | StdFee | "auto", memo?: string): Promise<DeliverTxResponse>;
    signAndGetTxBytes(messages: readonly EncodeObject[], fee: StdFee, memo: string, explicitSignerData?: SignerData): Promise<Uint8Array>;
}
export * from "./const";
//# sourceMappingURL=index.d.ts.map