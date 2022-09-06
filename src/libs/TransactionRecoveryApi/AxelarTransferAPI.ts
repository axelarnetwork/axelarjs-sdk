import { getConfigs } from "../../constants";
import {
  AxelarTransferAPIConfig,
  QueryTransferOptions,
  QueryTransferResponse,
  QueryTransferStatus,
} from "../types";
import { RestService } from "../../services";

export class AxelarTransferApi {
  private axelarCrosschainUrl: string;
  private axelarnscanUrl: string;
  readonly axelarCrosschainApi: RestService;

  public constructor(config: AxelarTransferAPIConfig) {
    const environment = config.environment;
    const links = getConfigs(environment);
    this.axelarCrosschainUrl = links.axelarCrosschainApiUrl;
    this.axelarnscanUrl = links.axelarscanUrl;
    this.axelarCrosschainApi = new RestService(this.axelarCrosschainUrl);
  }

  public async queryTransferStatus(
    txHash: string,
    options?: QueryTransferOptions
  ): Promise<QueryTransferResponse> {
    const response = await this.axelarCrosschainApi
      .post("/transfers-status", {
        txHash,
        ...options,
      })
      .catch(() => undefined);

    if (!response) {
      return {
        success: false,
        error: "Axelar Transfer API is not available",
      };
    }
    if (response.length === 0) {
      return {
        success: false,
        error: "No transfer found",
      };
    }

    const transfer = response[0];
    return {
      success: true,
      data: {
        id: transfer.source.id,
        status: transfer.status as QueryTransferStatus,
        type: transfer.source.type,
        amount: transfer.source.amount,
        fee: transfer.source.fee,
        denom: transfer.source.denom,
        senderChain: transfer.source.sender_chain,
        senderAddress: transfer.source.sender_address,
        recipientChain: transfer.source.recipient_chain,
        recipientAddress: transfer.source.recipient_address,
        blockExplorerUrl: `${this.axelarnscanUrl}/transfer/${transfer.source.id}`,
        blockHeight: transfer.source.height,
      },
    };
  }
}
