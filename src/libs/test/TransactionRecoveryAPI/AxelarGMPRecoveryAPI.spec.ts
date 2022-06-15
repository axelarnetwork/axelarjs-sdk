import { AxelarGMPRecoveryAPI } from "../../TransactionRecoveryApi/AxelarGMPRecoveryAPI";
import { Environment, EvmWalletDetails } from "../../types";

describe("AxelarDepositRecoveryAPI", () => {
  const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  xdescribe("confirmGatewayTx", () => {
    test("It should confirm a gateway tx", async () => {
      const testParamsAxelarnet = {
        txHash: "0xf452bc47fff8962190e114d0e1f7f3775327f6a5d643ca4fd5d39e9415e54503",
        chain: "Avalanche",
      };
      const confirmation = await api.confirmGatewayTx(testParamsAxelarnet);
      console.log("confirmation", confirmation);
      expect(confirmation).toBeTruthy();
    }, 60000);
  });

  describe("addGas", () => {
    test("It should invoke addNativeGas", async () => {
      // result of query for a previous tx hash here: https://testnet.api.gmp.axelarscan.io/?method=searchGMP&txHash=0xf459d54046b0507bd4b726bc64a7ce459053c53b0d858ea785d982e7c51594b0
      const gas_paid = {
        blockHash: "0x4ccd17b7c557e7062eba779bae37a84fdd6c808f0cf390d28d7cda17cdc5a082",
        chain: "avalanche",
        address: "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
        logIndex: 2,
        eventSignature:
          "NativeGasPaidForContractCallWithToken(address,string,string,bytes32,string,uint256,uint256,address)",
        transactionIndex: 1,
        contract_address: "0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6",
        transactionHash: "0xf459d54046b0507bd4b726bc64a7ce459053c53b0d858ea785d982e7c51594b0",
        returnValues: {
          refundAddress: "0x8C50F838768dcC41cC896c997D059015277Cc0dc",
          symbol: "UST",
          amount: { hex: "0x0f4240", type: "BigNumber" },
          sourceAddress: "0x8e20A82f3d20cF9c34c116431e7B24499D6639e5",
          destinationAddress: "0xd8f31EbCE3D553a1c159725D3e1140f56492de3e",
          gasFeeAmount: { hex: "0x2386f26fc10000", type: "BigNumber" },
          payloadHash: "0xd23cf54a5d3a6f7abe2da307932c1b14b47b4ccd8dc1dd7f30016b965c12a0c6",
          destinationChain: "moonbeam",
        },
        removed: false,
        block_timestamp: 1654509082,
        blockNumber: 10435640,
        id: "0xf459d54046b0507bd4b726bc64a7ce459053c53b0d858ea785d982e7c51594b0_1_2",
        event: "NativeGasPaidForContractCallWithToken",
      };
      const cb = jest.fn();
      const evmWalletDetails: EvmWalletDetails = { mnemonic: "your mnemonic here for testing" };
      await api.addNativeGas({ gas_paid }, cb, evmWalletDetails);
      expect(cb).toHaveBeenCalled();
    }, 60000);
  });
});
