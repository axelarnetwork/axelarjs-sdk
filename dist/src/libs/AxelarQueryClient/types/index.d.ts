import { QueryService as EvmQS } from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/service";
import { QueryService as AxelarnetQS } from "@axelar-network/axelarjs-types/axelar/axelarnet/v1beta1/service";
import { QueryService as NexusQS } from "@axelar-network/axelarjs-types/axelar/nexus/v1beta1/service";
import { QueryService as TSSQS } from "@axelar-network/axelarjs-types/axelar/tss/v1beta1/service";
import { QueryService as MultisigQS } from "@axelar-network/axelarjs-types/axelar/multisig/v1beta1/service";
import { QueryClient } from "@cosmjs/stargate";
export interface AxelarQueryService {
    readonly evm: EvmQS;
    readonly axelarnet: AxelarnetQS;
    readonly nexus: NexusQS;
    readonly tss: TSSQS;
    readonly multisig: MultisigQS;
}
export declare function setupQueryExtension(base: QueryClient): AxelarQueryService;
//# sourceMappingURL=index.d.ts.map