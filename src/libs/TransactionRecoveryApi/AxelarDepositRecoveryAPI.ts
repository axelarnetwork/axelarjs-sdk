import { AxelarRecoveryAPIConfig } from "../types";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { AxelarRecoveryApi } from "./AxelarRecoveryApi";
import { parseConfirmDepositCosmosResponse, parseConfirmDepositEvmResponse } from "./helpers/parseConfirmDepositEvent";
import { AxelarRetryResponse, ConfirmDepositRequest, ConfirmDepositResponse } from "./interface";
import { getConfirmedTx } from "./helpers/getConfirmedTx";
import { broadcastCosmosTx } from "./client/helpers/cosmos";
import { loadChains } from "../../chains";
import { ChainInfo } from "../../chains/types";

export class AxelarDepositRecoveryAPI extends AxelarRecoveryApi {
  private cacheBase64Tx = {
    confirmDeposit: null,
    createPendingTransfer: null,
    createSignTransfer: null,
  };

  public constructor(config: AxelarRecoveryAPIConfig) {
    super(config);
  }

  public async confirmDeposit(params: ConfirmDepositRequest, refetch = true): Promise<AxelarRetryResponse<ConfirmDepositResponse>> {
    const chain: ChainInfo | undefined = loadChains({
      environment: this.environment,
    }).find(
      (chain) =>
        chain.chainInfo.chainName.toLowerCase() === params.from.toLowerCase()
    )?.chainInfo;
    if (!chain) throw new Error("cannot find chain" + params.from);

    let base64Tx: string = "";
    let tx: DeliverTxResponse | null = await getConfirmedTx(
      params.hash,
      params.depositAddress,
      this.environment
    );
    if (!tx) {
      if (refetch || !this.cacheBase64Tx.confirmDeposit) {
        const newParams = {
          ...params,
          from: chain.chainIdentifier[this.environment],
        };
        base64Tx = await fetch(this.recoveryApiUrl + "/confirm_deposit_tx", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newParams),
        })
          .then((res) => res.json())
          .then((res) => res.data.base64Tx)
          .then((base64Tx) => {
            this.cacheBase64Tx.confirmDeposit = base64Tx;
            return base64Tx;
          });
      } else {
        base64Tx = this.cacheBase64Tx.confirmDeposit;
      }
      tx = await broadcastCosmosTx(base64Tx, this.axelarRpcUrl);
    }
    if (chain.module === "evm") {
      return parseConfirmDepositEvmResponse(tx);
    } else {
      return parseConfirmDepositCosmosResponse(tx);
    }
  }
}

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
