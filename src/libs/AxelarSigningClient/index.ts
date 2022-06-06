import { EnvironmentConfigs, getConfigs } from "../../constants";
import { RestService } from "../../services";
import { AxelarSigningClientConfig } from "../types";
import {
  SigningStargateClientOptions,
  SigningStargateClient,
  DeliverTxResponse,
  StdFee,
  SignerData,
} from "@cosmjs/stargate";
import {
  DirectSecp256k1HdWallet,
  EncodeObject,
  OfflineSigner,
  Registry,
} from "@cosmjs/proto-signing";
import { registerTxTypes } from "./types/TxTypes";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

let instance: AxelarSigningClient;

interface IAxelarSigningClient extends SigningStargateClient {
  signThenBroadcast(messages: readonly EncodeObject[], fee: number | StdFee | "auto", memo?: string): Promise<DeliverTxResponse>
  signAndGetTxBytes(messages: readonly EncodeObject[], fee: StdFee, memo: string, explicitSignerData?: SignerData): Promise<Uint8Array>
}

export class AxelarSigningClient extends SigningStargateClient implements IAxelarSigningClient {
  readonly rpcApi: RestService;
  readonly axelarRpcUrl: string;
  readonly signerAddress: string;
  protected signerClient: SigningStargateClient;

  public constructor(
    tendermintClient: Tendermint34Client,
    signer: OfflineSigner,
    signerAddress: string,
    options: SigningStargateClientOptions
  ) {
    super(tendermintClient, signer, options);
    this.signerAddress = signerAddress;
  }

  static async initOrGetAxelarSigningClient(config: AxelarSigningClientConfig) {
    if (!instance) {
      const { axelarRpcUrl, environment, options } = config;
      const links: EnvironmentConfigs = getConfigs(environment);
      const rpc: string = axelarRpcUrl || links.axelarRpcUrl;
      const tmClient = await Tendermint34Client.connect(rpc);
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(config.mnemonic, {
        prefix: "axelar",
      });
      const [account] = await wallet.getAccounts()

      let registry: Registry = options.registry || new Registry();
      registerTxTypes(registry);
      const newOpts = { ...options, registry };

      instance = new AxelarSigningClient(tmClient, wallet, account.address, newOpts);
    }
    return instance;
  }

  public signThenBroadcast(messages: readonly EncodeObject[], fee: number | StdFee | "auto", memo?: string): Promise<DeliverTxResponse> {
    return super.signAndBroadcast(this.signerAddress, messages, fee, memo)
  }

  public async signAndGetTxBytes(messages: readonly EncodeObject[], fee: StdFee, memo: string, explicitSignerData?: SignerData): Promise<Uint8Array> {
    const txRaw = await super.sign(this.signerAddress, messages, fee, memo, explicitSignerData);
    return TxRaw.encode(txRaw).finish();
  }

}
