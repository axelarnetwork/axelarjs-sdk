"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const retryRpc_1 = require("./helpers/retryRpc");
const cosmos_1 = require("./helpers/cosmos");
const constants_1 = require("../../../constants");
class AxelarRpcClient {
    constructor(environment) {
        const rpcUrl = (0, constants_1.getConfigs)(environment).axelarRpcUrl;
        this.client = (0, cosmos_1.createRPCClient)(rpcUrl);
    }
    static getOrCreate(environment) {
        return new AxelarRpcClient(environment);
    }
    query(request, msToRetries = 3000, maxRetries = 3) {
        const retryFunc = () => this.client.execute(request).then((response) => {
            if (request.method === "tx_search") {
                return response.result.txs;
            }
            else {
                return response.result;
            }
        });
        const errorHandler = (err) => {
            console.log(err);
        };
        return (0, retryRpc_1.retryRpc)(retryFunc, errorHandler, msToRetries, maxRetries);
    }
    unsubscribe() {
        this.client.disconnect();
    }
}
exports.default = AxelarRpcClient;
//# sourceMappingURL=AxelarRpcClient.js.map