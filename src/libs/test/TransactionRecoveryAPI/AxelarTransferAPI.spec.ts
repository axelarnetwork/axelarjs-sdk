import { AxelarTransferApi } from "../../TransactionRecoveryApi/AxelarTransferAPI";
import { Environment } from "../../types";

describe("AxelarTransferApi", () => {
  const api = new AxelarTransferApi({ environment: Environment.TESTNET });

  it("should query transfer status successfully when given tx hash is valid", async () => {
    const response = await api.queryTransferStatus(
      "6D1B1CD4B754280461BD7AD43B4838BBD8A467AA346B7584052025F83B5EB90F"
    );
    console.log(response);
    // response.data?.status;
  });
});
