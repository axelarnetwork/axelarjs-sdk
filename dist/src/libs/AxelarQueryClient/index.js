"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxelarQueryClient = void 0;
const stargate_1 = require("@cosmjs/stargate");
const tendermint_rpc_1 = require("@cosmjs/tendermint-rpc");
const constants_1 = require("../../constants");
const index_1 = require("./types/index");
class AxelarQueryClient extends stargate_1.QueryClient {
    static initOrGetAxelarQueryClient(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { axelarRpcUrl, environment } = config;
            const links = (0, constants_1.getConfigs)(environment);
            const rpc = axelarRpcUrl || links.axelarRpcUrl;
            return stargate_1.QueryClient.withExtensions(yield tendermint_rpc_1.Comet38Client.connect(rpc), index_1.setupQueryExtension);
        });
    }
}
exports.AxelarQueryClient = AxelarQueryClient;
//# sourceMappingURL=index.js.map