import { Contract, ContractReceipt } from "ethers";
import { ExecuteParams } from "../AxelarRecoveryApi";
export declare enum CALL_EXECUTE_ERROR {
    REVERT = "REVERT",
    INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS"
}
export declare function callExecute(params: ExecuteParams, contract: Contract, gasLimitBuffer?: number): Promise<ContractReceipt>;
//# sourceMappingURL=contractCallHelper.d.ts.map