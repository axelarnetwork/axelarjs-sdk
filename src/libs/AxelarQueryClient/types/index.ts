import {
  QueryService as EvmQS,
  QueryServiceClientImpl as EVMQSCI,
} from "@axelar-network/axelarjs-types/axelar/evm/v1beta1/service";
import {
  QueryService as AxelarnetQS,
  QueryServiceClientImpl as AxelarnetQSCI,
} from "@axelar-network/axelarjs-types/axelar/axelarnet/v1beta1/service";
import {
  QueryService as NexusQS,
  QueryServiceClientImpl as NexusQSCI,
} from "@axelar-network/axelarjs-types/axelar/nexus/v1beta1/service";
import {
  QueryService as TSSQS,
  QueryServiceClientImpl as TSSQSCI,
} from "@axelar-network/axelarjs-types/axelar/tss/v1beta1/service";
import { QueryClient, createProtobufRpcClient } from "@cosmjs/stargate";

export interface AxelarQueryService {
  readonly evm: EvmQS;
  readonly axelarnet: AxelarnetQS;
  readonly nexus: NexusQS;
  readonly tss: TSSQS;
}

export function setupQueryExtension(base: QueryClient): AxelarQueryService {
  const client = createProtobufRpcClient(base);
  return {
    evm: new EVMQSCI(client),
    axelarnet: new AxelarnetQSCI(client),
    nexus: new NexusQSCI(client),
    tss: new TSSQSCI(client)
  };
}
