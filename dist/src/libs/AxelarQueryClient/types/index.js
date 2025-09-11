"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupQueryExtension = setupQueryExtension;
const service_1 = require("@axelar-network/axelarjs-types/axelar/evm/v1beta1/service");
const service_2 = require("@axelar-network/axelarjs-types/axelar/axelarnet/v1beta1/service");
const service_3 = require("@axelar-network/axelarjs-types/axelar/nexus/v1beta1/service");
const service_4 = require("@axelar-network/axelarjs-types/axelar/tss/v1beta1/service");
const service_5 = require("@axelar-network/axelarjs-types/axelar/multisig/v1beta1/service");
const stargate_1 = require("@cosmjs/stargate");
function setupQueryExtension(base) {
    const client = (0, stargate_1.createProtobufRpcClient)(base);
    return {
        evm: new service_1.QueryServiceClientImpl(client),
        axelarnet: new service_2.QueryServiceClientImpl(client),
        nexus: new service_3.QueryServiceClientImpl(client),
        tss: new service_4.QueryServiceClientImpl(client),
        multisig: new service_5.QueryServiceClientImpl(client),
    };
}
//# sourceMappingURL=index.js.map