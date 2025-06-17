import { EnvironmentConfigs, getConfigs } from "../../constants";
import { RestService } from "../../services";
import { AxelarSigningClientConfig } from "../types";
import {
  SigningStargateClientOptions,
  SigningStargateClient,
  DeliverTxResponse,
  StdFee,
  SignerData,
  AminoTypes,
} from "@cosmjs/stargate";
import {
  DirectSecp256k1HdWallet as Wallet,
  EncodeObject,
  OfflineSigner,
  Registry,
} from "@cosmjs/proto-signing";
import { registerMultisigTxTypes } from "./types/MultisigTxTypes";
import { registerAxelarnetTxTypes } from "./types/AxelarnetTxTypes";
import { CometClient, connectComet } from "@cosmjs/tendermint-rpc";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { registerEvmTxTypes } from "./types/EvmTxTypes";
import { registerNexusTxTypes } from "./types/NexusTxTypes";
import { createAxelarAminoConverters } from "./aminomessages";

interface IAxelarSigningClient extends SigningStargateClient {
  signThenBroadcast(
    messages: readonly EncodeObject[],
    fee: number | StdFee | "auto",
    memo?: string
  ): Promise<DeliverTxResponse>;
  signAndGetTxBytes(
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    explicitSignerData?: SignerData
  ): Promise<Uint8Array>;
}

export class AxelarSigningClient extends SigningStargateClient implements IAxelarSigningClient {
  readonly rpcApi: RestService;
  readonly axelarRpcUrl: string;
  readonly signerAddress: string;
  protected signerClient: SigningStargateClient;

  public constructor(
    tendermintClient: CometClient,
    signer: OfflineSigner,
    signerAddress: string,
    options: SigningStargateClientOptions
  ) {
    super(tendermintClient, signer, options);
    this.signerAddress = signerAddress;
  }

  static async initOrGetAxelarSigningClient(config: AxelarSigningClientConfig) {
    const { axelarRpcUrl, environment, options, cosmosBasedWalletDetails: walletDetails } = config;
    const links: EnvironmentConfigs = getConfigs(environment);
    const rpc: string = axelarRpcUrl || links.axelarRpcUrl;
    const tmClient = await connectComet(rpc);
    const prefix = "axelar";

    let wallet;
    if (walletDetails.mnemonic)
      wallet = await Wallet.fromMnemonic(walletDetails.mnemonic, { prefix });
    else if (walletDetails.offlineSigner) wallet = walletDetails.offlineSigner;
    else throw "you need to pass in either a wallet mnemonic string or offline signer";

    const [account] = await wallet.getAccounts();

    const registry = options.registry || new Registry();
    registerMultisigTxTypes(registry);
    registerAxelarnetTxTypes(registry);
    registerEvmTxTypes(registry);
    registerNexusTxTypes(registry);
    const aminoTypes = options.aminoTypes || new AminoTypes(createAxelarAminoConverters());
    const newOpts = { ...options, registry, aminoTypes };

    return new AxelarSigningClient(tmClient, wallet, account.address, newOpts);
  }

  public signThenBroadcast(
    messages: readonly EncodeObject[],
    fee: number | StdFee | "auto",
    memo?: string
  ): Promise<DeliverTxResponse> {
    return super.signAndBroadcast(this.signerAddress, messages, fee, memo);
  }

  public async signAndGetTxBytes(
    messages: readonly EncodeObject[],
    fee: StdFee,
    memo: string,
    explicitSignerData?: SignerData
  ): Promise<Uint8Array> {
    const txRaw = await super.sign(this.signerAddress, messages, fee, memo, explicitSignerData);
    return TxRaw.encode(txRaw).finish();
  }
}

export * from "./const";
