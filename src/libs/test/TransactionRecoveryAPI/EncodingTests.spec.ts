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

  describe("manual relay", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
    test("It should create a command ID from a tx hash and event index", async () => {
      const txHash = "0x0a83f6bff1697bb1f72ee60713427e802f32571f042abfa7c6278024f440e861";
      const res = await api.manualRelayToDestChain(txHash, evmWalletDetails);
      expect(res).toEqual("58c46960e6483f61bf206d1bd1819917d2b009f58d7050e05b4be1d13247b4ed");
    }, 60000);
  });

  describe.skip("creating command ID", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
    test("It should create a command ID from a tx hash and event index", async () => {
      const txHash = "0x2c9083bebd1f82b86b7b0d3298885f90767b584742df9ec3a9c9f15872a1fff9";
      const eventIndex = await api.getEventIndex(
        "ethereum-2" as EvmChain,
        txHash,
        evmWalletDetails
      );
      const res = await api.getCidFromSrcTxHash(EvmChain.MOONBEAM, txHash, eventIndex as number);
      console.log("eventIndex", eventIndex);
      console.log("res", res);
      expect(res).toEqual("58c46960e6483f61bf206d1bd1819917d2b009f58d7050e05b4be1d13247b4ed");
    }, 60000);
  });
  describe.skip("checking event status", () => {
    const api = new AxelarGMPRecoveryAPI({ environment: Environment.TESTNET });
    test("fetching event status", async () => {
      const txHash = "0xa290f800f2089535a0abb013cea9cb26e1cdb3f2a2f2a8dcef2f149eb7a4d3be";
      const event = await api.getEvmEvent(EvmChain.MOONBEAM, EvmChain.POLYGON, txHash);
      console.log("event", event);
      const res = await api.isEVMEventCompleted(event.eventResponse);
      expect(res).toBeTruthy();
    }, 60000);
  });
});
