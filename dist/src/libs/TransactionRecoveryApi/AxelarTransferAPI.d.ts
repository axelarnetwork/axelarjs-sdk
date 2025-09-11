import { AxelarTransferAPIConfig, QueryTransferOptions, QueryTransferResponse } from "../types";
import { RestService } from "../../services";
export declare class AxelarTransferApi {
    private axelarCrosschainUrl;
    private axelarnscanUrl;
    readonly axelarCrosschainApi: RestService;
    constructor(config: AxelarTransferAPIConfig);
    queryTransferStatus(txHash: string, options?: QueryTransferOptions): Promise<QueryTransferResponse>;
}
//# sourceMappingURL=AxelarTransferAPI.d.ts.map