import { getConfigs } from "../../constants";
import {
  AxelarTransferAPIConfig,
  QueryTransferOptions,
  QueryTransferResponse,
  QueryTransferStatus,
} from "../types";
import fetch from "cross-fetch";

export class AxelarTransferApi {
  private axelarCrosschainApiUrl: string;
  private axelarnscanUrl: string;

  public constructor(config: AxelarTransferAPIConfig) {
    const environment = config.environment;
    const links = getConfigs(environment);
    this.axelarCrosschainApiUrl = links.axelarCrosschainApiUrl;
    this.axelarnscanUrl = links.axelarscanUrl;
  }

  public async queryTransferStatus(
    txHash: string,
    options?: QueryTransferOptions
  ): Promise<QueryTransferResponse> {
    const response = await fetch(`${this.axelarCrosschainApiUrl}/transfers-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        txHash,
        ...options,
      }),
    }).then((resp) => resp.json());
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
        blockexplorerUrl: `${this.axelarnscanUrl}/transfer/${transfer.source.id}`,
        blockHeight: transfer.source.height,
      },
    };
  }
}
