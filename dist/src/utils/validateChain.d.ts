import { Environment } from "../libs";
export declare function validateChainIdentifierOld(chainIdentifier: string, environment: Environment): Promise<{
    foundChain: boolean;
    bestMatch: string | boolean;
}>;
export declare function validateChainIdentifier(chainIdentifier: string, environment: Environment): Promise<{
    foundChain: boolean;
    bestMatch: string | boolean;
}>;
export declare function throwIfInvalidChainIds(chains: string[], environment: Environment): Promise<void>;
//# sourceMappingURL=validateChain.d.ts.map