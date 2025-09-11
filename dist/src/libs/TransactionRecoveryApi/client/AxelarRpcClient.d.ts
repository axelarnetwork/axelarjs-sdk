import { JsonRpcRequest } from "@cosmjs/json-rpc";
import { Environment } from "../../types";
export default class AxelarRpcClient {
    private client;
    subscribed: boolean;
    private constructor();
    static getOrCreate(environment: Environment): AxelarRpcClient;
    query(request: JsonRpcRequest, msToRetries?: number, maxRetries?: number): Promise<any>;
    unsubscribe(): void;
}
//# sourceMappingURL=AxelarRpcClient.d.ts.map