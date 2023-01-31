import { getConfigs } from "../../../constants";
import { AxelarTransferApi } from "../../TransactionRecoveryApi";
import { Environment } from "../../types";
import { transferResponseExecutedStub } from "../stubs";

describe("AxelarTransferApi", () => {
  const api = new AxelarTransferApi({ environment: Environment.TESTNET });

  it("should return error given the transfer api could not be reached", async () => {
    vitest.spyOn(api.axelarCrosschainApi, "post").mockRejectedValueOnce(undefined);
    const response = await api.queryTransferStatus("0x123");
    expect(response.success).toBe(false);
    expect(response.error).toBe("Axelar Transfer API is not available");
  });

  it("should return error when no transfer is found", async () => {
    vitest.spyOn(api.axelarCrosschainApi, "post").mockResolvedValueOnce([]);
    const response = await api.queryTransferStatus("0x123");
    expect(response.success).toBe(false);
    expect(response.error).toBe("No transfer found");
  });

  it("should query transfer status successfully when given tx hash is valid", async () => {
    const mockResponse = transferResponseExecutedStub();
    vitest.spyOn(api.axelarCrosschainApi, "post").mockResolvedValueOnce(mockResponse);
    const response = await api.queryTransferStatus(
      "6D1B1CD4B754280461BD7AD43B4838BBD8A467AA346B7584052025F83B5EB90F"
    );
    expect(response.success).toBe(true);
    expect(response.data).toEqual({
      id: mockResponse[0].source.id,
      status: mockResponse[0].status,
      type: mockResponse[0].source.type,
      amount: mockResponse[0].source.amount,
      fee: mockResponse[0].source.fee,
      denom: mockResponse[0].source.denom,
      senderChain: mockResponse[0].source.sender_chain,
      senderAddress: mockResponse[0].source.sender_address,
      recipientChain: mockResponse[0].source.recipient_chain,
      recipientAddress: mockResponse[0].source.recipient_address,
      blockHeight: mockResponse[0].source.height,
      blockExplorerUrl: `${getConfigs(Environment.TESTNET).axelarscanUrl}/transfer/${
        mockResponse[0].source.id
      }`,
    });
  });
});
