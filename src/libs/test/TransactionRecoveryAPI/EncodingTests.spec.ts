import { AxelarGMPRecoveryAPI } from "../../TransactionRecoveryApi/AxelarGMPRecoveryAPI";
import { AddGasOptions, Environment, EvmChain, EvmWalletDetails } from "../../types";
import { utils } from "@axelar-network/axelar-local-dev";

describe("AxelarDepositRecoveryAPI", () => {
  const { setLogger } = utils;
  setLogger(() => null);

  let evmWalletDetails: EvmWalletDetails;
  beforeEach(() => {
    vitest.clearAllMocks();
    evmWalletDetails = {
      privateKey: "",
      useWindowEthereum: false,
    };
  });

  describe("creating command ID", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
    test("It should create a command ID from a tx hash and event index", async () => {
      const txHash = "0xa290f800f2089535a0abb013cea9cb26e1cdb3f2a2f2a8dcef2f149eb7a4d3be";
      const eventIndex = await api.getEventIndex(EvmChain.MOONBEAM, txHash, evmWalletDetails);
      const res = await api.getCidFromSrcTxHash(EvmChain.MOONBEAM, txHash, eventIndex as number);
      expect(res).toEqual("58c46960e6483f61bf206d1bd1819917d2b009f58d7050e05b4be1d13247b4ed");
    }, 60000);
  });
  describe("checking event status", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
    test("fetching event status", async () => {
      const txHash = "0xa290f800f2089535a0abb013cea9cb26e1cdb3f2a2f2a8dcef2f149eb7a4d3be";
      const event = await api.getEvmEvent(EvmChain.MOONBEAM, txHash);
      const res = await api.isEVMEventCompleted(event.eventResponse);
      expect(res).toBeTruthy();
    }, 60000);
  });
});
