import { BatchedCommandsResponse } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/query";
import { EvmChain } from "../../types";
import { asyncRetry, sleep } from "../../../utils";
import { AxelarGMPRecoveryAPI } from "../AxelarGMPRecoveryAPI";
import { GMPStatus, GMPStatusResponse } from "../AxelarRecoveryApi";

enum AxelarGMPRecoveryProcessorResponse {
  TRIGGERED_RELAY = "triggered relay",
  APPROVED_BUT_NOT_EXECUTED = "approved but not executed",
  ALREADY_EXECUTED = "already executed",
  ERROR_FETCHING_STATUS = "error fetching status",
  ERROR_INVOKING_RECOVERY = "eror invoking recovery",
}

export default class AxelarGMPRecoveryProcessor {
  constructor(private recoveryAPI: AxelarGMPRecoveryAPI) {}
  public async process(params: {
    txHash: string;
    src: EvmChain;
    dest: EvmChain;
    debug?: boolean;
  }): Promise<AxelarGMPRecoveryProcessorResponse> {
    const { txHash, src, dest, debug } = params;

    const res: GMPStatusResponse = await this.recoveryAPI.queryTransactionStatus(txHash);

    if (!res || res.status === GMPStatus.ERROR_FETCHING_STATUS)
      return AxelarGMPRecoveryProcessorResponse.ERROR_FETCHING_STATUS;
    if (res.status === GMPStatus.DEST_EXECUTED)
      return AxelarGMPRecoveryProcessorResponse.ALREADY_EXECUTED;
    if (res.status === GMPStatus.DEST_GATEWAY_APPROVED)
      return AxelarGMPRecoveryProcessorResponse.APPROVED_BUT_NOT_EXECUTED;

    try {
      const confirmTx = await this.recoveryAPI.confirmGatewayTx({ txHash, chain: src });
      if (debug) console.log("confirmedTx", confirmTx);
      await sleep(2);

      const crt = await this.recoveryAPI.createPendingTransfers({ chain: dest });
      if (debug) console.log("pendingTransfer", crt);
      await sleep(2);

      const sc = await this.recoveryAPI.signCommands({ chain: dest });
      if (debug) console.log("signedCommand", sc);
      await sleep(2);

      const batched = await asyncRetry(
        () => this.recoveryAPI.queryBatchedCommands({ chain: dest, id: "" }),
        (res: BatchedCommandsResponse) =>
          res && res.executeData !== null && res.executeData.length > 0,
        undefined,
        30,
        5
      );
      if (debug) console.log("batchedCommand", batched);
      await sleep(2);

      const broadcasted = await this.recoveryAPI.sendEvmTxToRelayer(dest, batched.executeData);
      if (debug) console.log("broadcastedMsg", broadcasted);

      return AxelarGMPRecoveryProcessorResponse.TRIGGERED_RELAY;
    } catch (e) {
      console.error(e);
      return AxelarGMPRecoveryProcessorResponse.ERROR_INVOKING_RECOVERY;
    }
  }
}
