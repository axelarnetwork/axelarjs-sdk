import fetch from "cross-fetch";
import { loadChains } from "../../chains";
import { ChainInfo } from "../../chains/types";
import { EnvironmentConfigs, getConfigs } from "../../constants";
import { AxelarRecoveryAPIConfig, Environment, EvmChain } from "../types";
import { broadcastCosmosTxBytes } from "./client/helpers/cosmos";
import { AxelarQueryClient, AxelarQueryClientType } from "../AxelarQueryClient";
import EVMClient from "./client/EVMClient";
import { TransactionRequest } from "@ethersproject/providers";
import { rpcMap } from "./constants/chain";
import { BigNumber } from "ethers";

export enum GMPStatus {
  SRC_GATEWAY_CALLED = "source_gateway_called",
  DEST_GATEWAY_APPROVED = "destination_gateway_approved",
  DEST_EXECUTED = "destination_executed",
  DEST_ERROR = "error",
  ERROR_FETCHING_STATUS = "error_fetching_status"
}
export enum GasPaidStatus {
  GAS_UNPAID = "gas_unpaid",
  GAS_PAID = "gas_paid",
  GAS_PAID_NOT_ENOUGH_GAS = "gas_paid_not_enough_gas",
  GAS_PAID_ENOUGH_GAS = "gas_paid_enough_gas",

}
export interface GasPaidInfo {
  status: GasPaidStatus;
  details?: any;
}
export interface GMPStatusResponse {
  status: GMPStatus;
  gasPaidInfo?: GasPaidInfo;
  errors?: any;
  callData?: any;
}

export interface ExecuteParams {
  commandId: string;
  sourceChain: string;
  destinationChain: EvmChain;
  sourceAddress: string;
  destinationContractAddress: string;
  payload: string;
  symbol?: string;
  amount?: string;
  isContractCallWithToken: boolean;
}

export interface ExecuteParamsResponse {
  status: GMPStatus;
  data?: ExecuteParams;
}

export class AxelarRecoveryApi {
  readonly environment: Environment;
  readonly recoveryApiUrl: string;
  readonly axelarCachingServiceUrl: string;
  readonly axelarRpcUrl: string;
  readonly config: AxelarRecoveryAPIConfig;
  protected axelarQuerySvc: AxelarQueryClientType | null = null;
  protected evmClient: EVMClient;

  public constructor(config: AxelarRecoveryAPIConfig) {
    const { environment } = config;
    const links: EnvironmentConfigs = getConfigs(environment);
    this.axelarCachingServiceUrl = links.axelarCachingServiceUrl;
    this.recoveryApiUrl = links.recoveryApiUrl;
    this.axelarRpcUrl = links.axelarRpcUrl;
    this.environment = environment;
    this.config = config;
  }

  public async queryTransactionStatus(txHash: string): Promise<GMPStatusResponse> {
    let isError = false;
    let status = GMPStatus.ERROR_FETCHING_STATUS;

    const txDetails = await this.execGet(this.axelarCachingServiceUrl, {
      method: "searchGMP",
      txHash,
    })
      .then((res) => res[0])
      .catch((e) => {
        isError = true;
      });

    if (!txDetails || isError) return { status };

    const { approved, call, gas_status, gas_paid, is_executed, error } = txDetails;

    const gasPaidInfo: GasPaidInfo = {
      status: gas_status,
      details: gas_paid,
    };

    if (is_executed) status = GMPStatus.DEST_EXECUTED
    else if (approved) status = GMPStatus.DEST_GATEWAY_APPROVED
    else if (call) status = GMPStatus.SRC_GATEWAY_CALLED

    return {
      status,
      errors: error,
      gasPaidInfo,
      callData: call,
    };
  }

  public async queryExecuteParams(txHash: string): Promise<Nullable<ExecuteParamsResponse>> {
    const res = await this.execGet(this.axelarCachingServiceUrl, {
      method: "searchGMP",
      txHash,
    });
    if (!res) return;
    if (!res[0]) return;
    const data = res[0];

    // Return if approve tx doesn't not exist
    const approvalTx = data.approved;
    if (!approvalTx?.transactionHash) {
      return {
        status: GMPStatus.SRC_GATEWAY_CALLED,
      };
    }

    // Return if it's already executed
    const executeTx = data.executed;
    if (executeTx?.transactionHash) {
      return {
        status: GMPStatus.DEST_EXECUTED,
      };
    }
    const callTx = data.call;

    return {
      status: GMPStatus.DEST_GATEWAY_APPROVED,
      data: {
        commandId: approvalTx.returnValues.commandId,
        destinationChain: approvalTx.chain.toLowerCase() as EvmChain,
        destinationContractAddress: callTx.returnValues.destinationContractAddress,
        isContractCallWithToken: callTx.event === "ContractCallWithToken",
        payload: callTx.returnValues.payload,
        sourceAddress: approvalTx.returnValues.sourceAddress,
        sourceChain: approvalTx.returnValues.sourceChain,
        symbol: approvalTx.returnValues.symbol,
        amount:
          approvalTx.returnValues.amount &&
          BigNumber.from(approvalTx.returnValues.amount).toString(),
      },
    };
  }

  public async createPendingTransfers(params: { chain: string }) {
    const chain: ChainInfo = loadChains({
      environment: this.environment,
    }).find((chain) => chain.chainInfo.chainName.toLowerCase() === params.chain.toLowerCase())
      ?.chainInfo as ChainInfo;
    if (!chain) throw new Error("cannot find chain" + params.chain);

    const txBytes = await this.execRecoveryUrlFetch("/create_pending_transfers", {
      ...params,
      chain: params.chain,
      module: chain.module,
    });

    return await broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);
  }

  public async executePendingTransfers(params: { chain: string }) {
    const chain: ChainInfo = loadChains({
      environment: this.environment,
    }).find((chain) => chain.chainInfo.chainName.toLowerCase() === params.chain.toLowerCase())
      ?.chainInfo as ChainInfo;
    if (!chain) throw new Error("cannot find chain" + params.chain);

    const txBytes = await this.execRecoveryUrlFetch("/execute_pending_transfers", {
      ...params,
      module: chain.module,
    });

    return await broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);
  }

  public async signCommands(params: { chain: string }) {
    const chain: ChainInfo = loadChains({
      environment: this.environment,
    }).find((chain) => chain.chainInfo.chainName.toLowerCase() === params.chain.toLowerCase())
      ?.chainInfo as ChainInfo;
    if (!chain) throw new Error("cannot find chain" + params.chain);

    const txBytes = await this.execRecoveryUrlFetch("/sign_commands", {
      ...params,
      module: chain.module,
    });

    return await broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);
  }

  public async queryBatchedCommands({ chain, id }: { chain: string; id?: string }) {
    if (!this.axelarQuerySvc)
      this.axelarQuerySvc = await AxelarQueryClient.initOrGetAxelarQueryClient(this.config);
    return await this.axelarQuerySvc.evm.BatchedCommands({ chain, id: id || "" });
  }

  public async queryGatewayAddress({ chain }: { chain: string }) {
    if (!this.axelarQuerySvc)
      this.axelarQuerySvc = await AxelarQueryClient.initOrGetAxelarQueryClient(this.config);
    return await this.axelarQuerySvc.evm.GatewayAddress({ chain });
  }

  public async getSignedTxAndBroadcast(chain: EvmChain, data: string) {
    const gatewayInfo = await this.queryGatewayAddress({ chain });
    const evmClient = new EVMClient({
      rpcUrl: rpcMap[chain],
      evmWalletDetails: { useWindowEthereum: true },
    });
    const txRequest: TransactionRequest = evmClient.buildUnsignedTx(gatewayInfo.address, { data });
    const signedTx = await this.execRecoveryUrlFetch("/sign_evm_tx", {
      chain,
      gatewayAddress: gatewayInfo.address,
      txRequest,
    });
    const tx = await evmClient.broadcastSignedTx(signedTx);
    tx.wait(1);
    return tx;
  }

  public async sendEvmTxToRelayer(chain: EvmChain, data: string) {
    const gatewayInfo = await this.queryGatewayAddress({ chain });
    const evmClient = new EVMClient({
      rpcUrl: rpcMap[chain],
      evmWalletDetails: { useWindowEthereum: true },
    });

    const txRequest: TransactionRequest = evmClient.buildUnsignedTx(gatewayInfo.address, { data });

    return await this.execRecoveryUrlFetch("/send_evm_tx", {
      chain,
      gatewayAddress: gatewayInfo.address,
      txRequest,
    });
  }

  public async broadcastEvmTx(chain: EvmChain, data: string) {
    const gatewayInfo = await this.queryGatewayAddress({ chain });
    const evmClient = new EVMClient({
      rpcUrl: rpcMap[chain],
      evmWalletDetails: { useWindowEthereum: true },
    });
    return await evmClient.broadcastToGateway(gatewayInfo.address, { data });
  }

  public async execRecoveryUrlFetch(endpoint: string, params: any) {
    return await this.execPost(this.recoveryApiUrl, endpoint, params);
  }

  public async execPost(base: string, endpoint: string, params: any) {
    return await fetch(base + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
      .then((res) => res.json())
      .then((res) => res.data);
  }

  public async execGet(base: string, params?: any) {
    return await fetch(base + "?" + new URLSearchParams(params).toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((res) => res.data);
  }
  get getAxelarCachingServiceUrl(): string {
    return this.axelarCachingServiceUrl;
  }
}
