import { BatchedCommandsResponse } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/query";
import { BatchedCommandsStatus } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/types";
import { BatchedCommandsAxelarscanResponse } from "../AxelarRecoveryApi";

/**
* core returns a number response that's typed to an enum:
    "export declare enum BatchedCommandsStatus {
        BATCHED_COMMANDS_STATUS_UNSPECIFIED = 0,
        BATCHED_COMMANDS_STATUS_SIGNING = 1,
        BATCHED_COMMANDS_STATUS_ABORTED = 2,
        BATCHED_COMMANDS_STATUS_SIGNED = 3,
        UNRECOGNIZED = -1
    }"
 * axelarscan response has the actual text response, so this method retrieves the text
* sample input: 3
* expected output: BATCHED_COMMANDS_STATUS_SIGNED
*/
const getStatusKey = (obj: any, value: BatchedCommandsStatus): string => {
  const keyIndex = Object.values(obj).indexOf(value);
  return Object.keys(obj)[keyIndex];
};

export const mapIntoAxelarscanResponseType = (
  input: BatchedCommandsResponse,
  chainId: string
): BatchedCommandsAxelarscanResponse => ({
  ...input,
  key_id: input.keyId,
  execute_data: input.executeData,
  prev_batched_commands_id: input.prevBatchedCommandsId,
  command_ids: input.commandIds,
  batch_id: input.id,
  chain: chainId,
  status: getStatusKey(BatchedCommandsStatus, input.status),
});
