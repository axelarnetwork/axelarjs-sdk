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
exports.AxelarDepositRecoveryAPI = void 0;
const AxelarRecoveryApi_1 = require("./AxelarRecoveryApi");
const cosmos_1 = require("./client/helpers/cosmos");
const chains_1 = require("../../chains");
const axelarHelper_1 = require("./helpers/axelarHelper");
const utils_1 = require("../../utils");
class AxelarDepositRecoveryAPI extends AxelarRecoveryApi_1.AxelarRecoveryApi {
    constructor(config) {
        super(config);
    }
    confirmDeposit(params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_1.throwIfInvalidChainIds)([params.from], this.environment);
            const chain = (yield (0, chains_1.loadChains)({
                environment: this.environment,
            })).find((chainInfo) => chainInfo.id.toLowerCase() === params.from.toLowerCase());
            if (!chain)
                throw new Error("cannot find chain" + params.from);
            const txBytes = yield this.execRecoveryUrlFetch("/confirm_deposit_tx", Object.assign(Object.assign({}, params), { sourceChain: chain.chainIdentifier[this.environment], module: chain.module }));
            const tx = yield (0, cosmos_1.broadcastCosmosTxBytes)(txBytes, this.axelarRpcUrl);
            if (chain.module === "evm") {
                return (0, axelarHelper_1.parseConfirmDepositEvmResponse)(tx);
            }
            else {
                return (0, axelarHelper_1.parseConfirmDepositCosmosResponse)(tx);
            }
        });
    }
    routeIBCTransfers() {
        return __awaiter(this, void 0, void 0, function* () {
            const txBytes = yield this.execRecoveryUrlFetch("/route_ibc_transfers", {
                module: "axelarnet",
            });
            return (0, cosmos_1.broadcastCosmosTxBytes)(txBytes, this.axelarRpcUrl);
        });
    }
}
exports.AxelarDepositRecoveryAPI = AxelarDepositRecoveryAPI;
/**
 *
 * TERRA >> AVALANCHE

echo $KEYRING_PASSWORD | axelard tx axelarnet link avalanche 0x74Ccd7d9F1F40417C6F7fD1151429a2c44c34e6d uusd --from validator

terrad tx ibc-transfer transfer transfer channel-45 axelar1p69uywznqhd5lrfsa3f0297gnjs7h8vn3qk3awcuhdeu7sxs8dzqkqpm2s --packet-timeout-timestamp 0 5000000uusd --gas-prices 0.15uusd --from ctt_devnet_terra -y -b block

—> return tx hash: EB2819BD7D43154775FC2BCB1A553363BB509BE866DDE4F29E38F048B8F890CE

echo $KEYRING_PASSWORD | axelard tx axelarnet confirm-deposit ibc/6F4968A73F90CF7DE6394BF937D6DF7C7D162D74D839C13F53B41157D315E05F axelar1mevnl2qax5ncxe4fguc6weua4j9wlv5ttj298pw6j62u0804uvtqm036cx --from validator

echo $KEYRING_PASSWORD | axelard tx evm create-pending-transfers avalanche --from validator --gas auto --gas-adjustment 1.2 && echo $KEYRING_PASSWORD | axelard tx evm sign-commands avalanche --from validator --gas auto --gas-adjustment 1.2

—> get batched command ID: ed04477f0ed591357e8302227db484bd9e7a4684f27715c15e38fcec957bcb5b

axelard q evm batched-commands avalanche 85daabb34e185ab14e1d91686c96822b00feb25874b4af5f5c936f4c7781abe4

axelard q evm gateway-address avalanche

 */
/**
 * ETHEREUM >> TERRA

axelard tx evm link ethereum terra terra1d5umjr4j0k8c8qtd500mzw2f99kptqqxw2rzph uusd --from validator

BURNER ETHEREUM ADDR: 0xC74137D1a1Bd05BD06FE2239D9F01eC420AF817e
(NOW DO STUFF ON ETHEREUM)

txId from ropsten: 0xb6916d034510fef318dff8ac2ec84a45a67e0c061c9d774eed1bdde05a30d1ed

echo $KEYRING_PASSWORD | axelard tx evm confirm-erc20-deposit ethereum 0xb7b5b570c92d6bbb302428158ed121a492d476c4c28871d586318f22e0afb99f 1598000000 0x62253325aee3b7f43358b3cfcb974589e6109e38 --from validator

echo $KEYRING_PASSWORD | axelard tx axelarnet execute-pending-transfers --from validator --gas auto --gas-adjustment 1.2
 */
//# sourceMappingURL=AxelarDepositRecoveryAPI.js.map