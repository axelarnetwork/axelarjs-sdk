import { BatchedCommandsResponse } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/query";
import { asyncRetry, sleep } from "../../../utils";
import { AxelarGMPRecoveryAPI } from "../AxelarGMPRecoveryAPI";
import { GMPStatus, GMPStatusResponse } from "../AxelarRecoveryApi";

export default class AxelarGMPRecoveryProcessor {
  constructor(private recoveryAPI: AxelarGMPRecoveryAPI) {}
  public async process(params: {
    txHash: string;
    src: string;
    dest: string;
    debug?: boolean;
  }): Promise<"triggered relay" | "approved but not executed" | "already executed" | unknown> {
    const { txHash, src, dest, debug } = params;

    const res: GMPStatusResponse = await this.recoveryAPI.queryTransactionStatus(txHash);

    if (res.status === GMPStatus.EXECUTED) return "already executed";
    if (res.status === GMPStatus.APPROVED) return "approved but not executed";

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

      return "triggered relay";
    } catch (e) {
      console.log(e);
      return e;
    }
  }
}
