export * from "./supported-chains-list";
import { ChainInfo, LoadChainConfig } from "./types";
import { Environment } from "../libs";
export declare function loadChains(config: LoadChainConfig): Promise<ChainInfo[]>;
export declare function importS3Config(environment: Environment): Promise<any>;
export declare function importChains(config: LoadChainConfig): Promise<ChainInfo[]>;
//# sourceMappingURL=index.d.ts.map