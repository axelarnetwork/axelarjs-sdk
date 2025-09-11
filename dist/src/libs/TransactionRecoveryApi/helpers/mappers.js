"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapIntoAxelarscanResponseType = void 0;
const types_1 = require("@axelar-network/axelarjs-types/axelar/evm/v1beta1/types");
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
const getStatusKey = (obj, value) => {
    const keyIndex = Object.values(obj).indexOf(value);
    return Object.keys(obj)[keyIndex];
};
const mapIntoAxelarscanResponseType = (input, chainId) => (Object.assign(Object.assign({}, input), { key_id: input.keyId, execute_data: input.executeData, prev_batched_commands_id: input.prevBatchedCommandsId, command_ids: input.commandIds, batch_id: input.id, chain: chainId, status: getStatusKey(types_1.BatchedCommandsStatus, input.status) }));
exports.mapIntoAxelarscanResponseType = mapIntoAxelarscanResponseType;
//# sourceMappingURL=mappers.js.map