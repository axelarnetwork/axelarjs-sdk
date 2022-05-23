import { HttpClient } from "@cosmjs/tendermint-rpc";
import { JsonRpcRequest } from "@cosmjs/json-rpc";
import { retryRpc } from "./helpers/retryRpc";
import { createRPCClient } from "./helpers/cosmos";
import { Environment } from "src/libs/types";
import { getConfigs } from "src/constants";

let instance: AxelarRpcClient;
export default class AxelarRpcClient {
  private client: HttpClient;
  subscribed: boolean;

  private constructor(environment: Environment) {
    const rpcUrl: string = getConfigs(environment).axelarRpcUrl;
    this.client = createRPCClient(rpcUrl);
  }

  static getOrCreate(environment: Environment) {
    if (!instance) {
      instance = new AxelarRpcClient(environment);
    }
    return instance;
  }

  query(request: JsonRpcRequest, msToRetries = 3000, maxRetries = 3) {
    const retryFunc = () =>
      this.client.execute(request).then((response) => {
        if (request.method === "tx_search") {
          return response.result.txs;
        } else {
          return response.result;
        }
      });
    const errorHandler = (err: Error) => {
      console.log(err);
    };
    return retryRpc(retryFunc, errorHandler, msToRetries, maxRetries);
  }

  unsubscribe() {
    this.client.disconnect();
  }
}
