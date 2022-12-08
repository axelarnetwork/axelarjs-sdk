import fetch from "cross-fetch";
import { loadChains } from "../../chains";
import { EnvironmentConfigs, getConfigs } from "../../constants";
import { AxelarRecoveryAPIConfig, Environment, EvmChain, EvmWalletDetails } from "../types";
import { broadcastCosmosTxBytes } from "./client/helpers/cosmos";
import { AxelarQueryClient, AxelarQueryClientType } from "../AxelarQueryClient";
import EVMClient from "./client/EVMClient";
import { TransactionRequest } from "@ethersproject/providers";
import rpcInfo from "./constants/chain";
import { BigNumber } from "ethers";
import { throwIfInvalidChainIds } from "../../utils";

export enum GMPStatus {
  SRC_GATEWAY_CALLED = "source_gateway_called",
  DEST_GATEWAY_APPROVED = "destination_gateway_approved",
  DEST_EXECUTED = "destination_executed",
  DEST_EXECUTE_ERROR = "error",
  DEST_EXECUTING = "executing",
  APPROVING = "approving",
  FORECALLED = "forecalled",
  FORECALLED_WITHOUT_GAS_PAID = "forecalled_without_gas_paid",
  NOT_EXECUTED = "not_executed",
  NOT_EXECUTED_WITHOUT_GAS_PAID = "not_executed_without_gas_paid",
  INSUFFICIENT_FEE = "insufficient_fee",
  UNKNOWN_ERROR = "unknown_error",
  CANNOT_FETCH_STATUS = "cannot_fetch_status",
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
  status: GMPStatus | string;
  timeSpent?: Record<string, number>;
  gasPaidInfo?: GasPaidInfo;
  error?: GMPError;
  callTx?: any;
  executed?: any;
  approved?: any;
  callback?: any;
}

export interface GMPError {
  txHash: string;
  chain: string;
  message: string;
}

export interface ExecuteParams {
  commandId: string;
  sourceChain: string;
  sourceAddress: string;
  payload: string;
  symbol?: string;
  amount?: string;
  destinationContractAddress: string;
  destinationChain: EvmChain;
  isContractCallWithToken: boolean;
}

export interface ExecuteParamsResponse {
  status: GMPStatus;
  data?: ExecuteParams;
}

export class AxelarRecoveryApi {
  readonly environment: Environment;
  readonly recoveryApiUrl: string;
  readonly axelarGMPApiUrl: string;
  readonly axelarRpcUrl: string;
  readonly axelarLcdUrl: string;
  readonly config: AxelarRecoveryAPIConfig;
  protected axelarQuerySvc: AxelarQueryClientType | null = null;
  protected evmClient: EVMClient;

  public constructor(config: AxelarRecoveryAPIConfig) {
    const { environment } = config;
    const links: EnvironmentConfigs = getConfigs(environment);
    this.axelarGMPApiUrl = links.axelarGMPApiUrl;
    this.recoveryApiUrl = links.recoveryApiUrl;
    this.axelarRpcUrl = config.axelarRpcUrl || links.axelarRpcUrl;
    this.axelarLcdUrl = config.axelarLcdUrl || links.axelarLcdUrl;
    this.environment = environment;
    this.config = config;
  }

  public async fetchGMPTransaction(txHash: string, txLogIndex?: number) {
    return this.execGet(this.axelarGMPApiUrl, {
      method: "searchGMP",
      txHash,
      txLogIndex,
    })
      .then((data) => data.find((gmpTx: any) => gmpTx.id.indexOf(txHash) > -1))
      .catch(() => undefined);
  }

  private parseGMPStatus(response: any): GMPStatus | string {
    const { error, status } = response;

    if (status === "error" && error) return GMPStatus.DEST_EXECUTE_ERROR;
    else if (status === "executed") return GMPStatus.DEST_EXECUTED;
    else if (status === "approved") return GMPStatus.DEST_GATEWAY_APPROVED;
    else if (status === "called") return GMPStatus.SRC_GATEWAY_CALLED;
    else if (status === "executing") return GMPStatus.DEST_EXECUTING;
    else {
      return status;
    }
  }

  private parseGMPError(response: any): GMPError | undefined {
    if (response.error) {
      return {
        message: response.error.error.message,
        txHash: response.error.error.transactionHash,
        chain: response.error.chain,
      };
    } else if (response.is_insufficient_fee) {
      return {
        message: "Insufficient fee",
        txHash: response.call.transaction.hash,
        chain: response.call.chain,
      };
    }
  }

  public async queryTransactionStatus(txHash: string): Promise<GMPStatusResponse> {
    const txDetails = await this.fetchGMPTransaction(txHash);

    if (!txDetails) return { status: GMPStatus.CANNOT_FETCH_STATUS };

    const { call, gas_status, gas_paid, executed, approved, callback } = txDetails;

    const gasPaidInfo: GasPaidInfo = {
      status: gas_status,
      details: gas_paid,
    };

    // Note: Currently, the GMP API doesn't always return the `total` field in the `time_spent` object
    // This is a temporary fix to ensure that the `total` field is always present
    // TODO: Remove this once the API is fixed
    const timeSpent: Record<string, number> = txDetails.time_spent;
    if (timeSpent) {
      timeSpent.total =
        timeSpent.total ||
        Object.values(timeSpent).reduce(
          (accumulator: number, value: number) => accumulator + value,
          0
        );
    }

    return {
      status: this.parseGMPStatus(txDetails),
      error: this.parseGMPError(txDetails),
      timeSpent,
      gasPaidInfo,
      callTx: call,
      executed,
      approved,
      callback,
    };
  }

  public async queryExecuteParams(
    txHash: string,
    txLogIndex?: number
  ): Promise<Nullable<ExecuteParamsResponse>> {
    const data = await this.fetchGMPTransaction(txHash, txLogIndex);
    if (!data) return;

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
        destinationChain: approvalTx.chain.toLowerCase(),
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

  private async getChainInfo(chainId: string) {
    const chainInfo = (
      await loadChains({
        environment: this.environment,
      })
    ).find((chainInfo) => chainInfo.id.toLowerCase() === chainId.toLowerCase());

    if (!chainInfo) throw new Error("cannot find chain" + chainId);

    return chainInfo;
  }

  public async confirmGatewayTx(txHash: string, chainName: string) {
    const { module, chainIdentifier } = await this.getChainInfo(chainName);

    const txBytes = await this.execRecoveryUrlFetch("/confirm_gateway_tx", {
      txHash,
      module,
      chain: chainIdentifier[this.environment],
    });

    return broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);
  }

  public async createPendingTransfers(chainName: string) {
    const { module, chainIdentifier } = await this.getChainInfo(chainName);

    const txBytes = await this.execRecoveryUrlFetch("/create_pending_transfers", {
      chain: chainIdentifier[this.environment],
      module,
    });

    return broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);
  }

  public async executePendingTransfers(chainName: string) {
    const { module, chainIdentifier } = await this.getChainInfo(chainName);
    const txBytes = await this.execRecoveryUrlFetch("/execute_pending_transfers", {
      chain: chainIdentifier[this.environment],
      module,
    });

    return broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);
  }

  public async signCommands(chainName: string) {
    const { module, chainIdentifier } = await this.getChainInfo(chainName);

    const txBytes = await this.execRecoveryUrlFetch("/sign_commands", {
      chain: chainIdentifier[this.environment],
      module,
    });

    return broadcastCosmosTxBytes(txBytes, this.axelarRpcUrl);
  }

  public async queryBatchedCommands(chainId: string, batchCommandId = "") {
    if (!this.axelarQuerySvc)
      this.axelarQuerySvc = await AxelarQueryClient.initOrGetAxelarQueryClient(this.config);
    await throwIfInvalidChainIds([chainId], this.environment);
    return this.axelarQuerySvc.evm.BatchedCommands({ chain: chainId, id: batchCommandId });
  }

  public async queryGatewayAddress({ chain }: { chain: string }) {
    if (!this.axelarQuerySvc)
      this.axelarQuerySvc = await AxelarQueryClient.initOrGetAxelarQueryClient(this.config);
    await throwIfInvalidChainIds([chain], this.environment);
    return this.axelarQuerySvc.evm.GatewayAddress({ chain });
  }

  public async getSignedTxAndBroadcast(chain: string, data: string) {
    await throwIfInvalidChainIds([chain], this.environment);
    const gatewayInfo = await this.queryGatewayAddress({ chain });
    const evmClient = new EVMClient({
      rpcUrl: rpcInfo[this.environment].rpcMap[chain],
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

  public async sendApproveTx(chain: string, data: string, evmWalletDetails: EvmWalletDetails) {
    await throwIfInvalidChainIds([chain], this.environment);
    const gatewayInfo = await this.queryGatewayAddress({ chain });
    const evmClient = new EVMClient({
      rpcUrl: rpcInfo[this.environment].rpcMap[chain],
      evmWalletDetails,
    });

    const txRequest: TransactionRequest = evmClient.buildUnsignedTx(gatewayInfo.address, { data });

    return this.execRecoveryUrlFetch("/send_evm_tx", {
      chain,
      gatewayAddress: gatewayInfo.address,
      txRequest,
    });
  }

  public async broadcastEvmTx(
    chain: string,
    data: string,
    evmWalletDetails = { useWindowEthereum: true }
  ) {
    await throwIfInvalidChainIds([chain], this.environment);
    const gatewayInfo = await this.queryGatewayAddress({ chain });
    const evmClient = new EVMClient({
      rpcUrl: rpcInfo[this.environment].rpcMap[chain],
      evmWalletDetails,
    });
    return evmClient.broadcastToGateway(gatewayInfo.address, { data });
  }

  public async execRecoveryUrlFetch(endpoint: string, params: any) {
    return this.execPost(this.recoveryApiUrl, endpoint, params);
  }

  public async execPost(base: string, endpoint: string, params: any) {
    return fetch(base + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
      .then((res) => res.json())
      .then((res) => res.data);
  }

  public async execGet(base: string, params?: any) {
    return fetch(base + "?" + new URLSearchParams(params).toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((res) => res.data);
  }
  get getAxelarGMPApiUrl(): string {
    return this.axelarGMPApiUrl;
  }
}
