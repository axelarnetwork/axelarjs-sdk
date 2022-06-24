import { callExecute } from "../../../TransactionRecoveryApi/helpers";
import { contractReceiptStub, executeParamsStub } from "../../stubs";

describe("contractCallHelper", () => {
  describe("callContract", () => {
    let mockWait: jest.Mock<any, any>;
    const stub = executeParamsStub();

    beforeEach(() => {
      mockWait = jest.fn().mockResolvedValueOnce(contractReceiptStub());
    });

    test("it should call 'executeWithToken' given 'isContractCallWithToken' is true", async () => {
      stub.isContractCallWithToken = true;

      // Mock contract's executeWithTokenFunction
      const mockExecuteWithToken = jest.fn().mockResolvedValueOnce({ wait: mockWait });
      const contract: any = { executeWithToken: mockExecuteWithToken };

      await callExecute(stub, contract);

      expect(mockExecuteWithToken).toHaveBeenCalledWith(
        stub.commandId,
        stub.sourceChain,
        stub.sourceAddress,
        stub.payload,
        stub.symbol,
        stub.amount
      );
      expect(mockWait).toBeCalledTimes(1);
    });

    test("it should call 'execute' given 'isContractCallWithToken' is false", async () => {
      const stub = executeParamsStub();

      // Mock contract's execute function
      const mockExecute = jest.fn().mockResolvedValueOnce({ wait: mockWait });
      const contract: any = { execute: mockExecute };

      stub.isContractCallWithToken = false;
      await callExecute(stub, contract);

      expect(mockExecute).toHaveBeenCalledWith(
        stub.commandId,
        stub.sourceChain,
        stub.sourceAddress,
        stub.payload
      );
      expect(mockWait).toBeCalledTimes(1);
    });
  });
});
