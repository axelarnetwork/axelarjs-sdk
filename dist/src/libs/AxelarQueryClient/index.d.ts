import { QueryClient } from "@cosmjs/stargate";
import { AxelarQueryClientConfig } from "../types";
import { AxelarQueryService } from "./types/index";
export type AxelarQueryClientType = QueryClient & AxelarQueryService;
export declare class AxelarQueryClient extends QueryClient {
    static initOrGetAxelarQueryClient(config: AxelarQueryClientConfig): Promise<QueryClient & AxelarQueryService>;
}
//# sourceMappingURL=index.d.ts.map