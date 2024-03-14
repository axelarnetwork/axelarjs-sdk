import { ethers } from "ethers";
import { rpcMap } from "../TransactionRecoveryApi/constants/chain/mainnet";
import { Environment, EstimateL1FeeParams } from "../types";
import { getL1FeeForL2 } from "./getL1Fee";
import { AxelarQueryAPI } from "../AxelarQueryAPI";
import { DEFAULT_L1_EXECUTE_DATA } from "../../constants";

const env = Environment.MAINNET;

async function getL1Fee(srcChain: string, destChain: string) {
  const queryAPI = new AxelarQueryAPI({ environment: env });

  const { destToken, l2_type } = await queryAPI.getNativeGasBaseFee(srcChain, destChain);

  const params: EstimateL1FeeParams = {
    executeData: DEFAULT_L1_EXECUTE_DATA,
    destChain,
    l1GasPrice: destToken.l1_gas_price_in_units!,
    l2Type: l2_type,
  };

  const provider = new ethers.providers.JsonRpcProvider(rpcMap[destChain]);
  const fee = await getL1FeeForL2(provider, params);

  return fee;
}

describe("getL1Fee", () => {
  it("query l1 fee for l2 chains should work", async () => {
    const srcChain = "ethereum";
    const destChains = ["optimism", "blast", "mantle", "fraxtal", "base"];

    const queries = destChains.map((destChain) => getL1Fee(srcChain, destChain));

    const fees = await Promise.all(queries);

    expect(fees.length).toBe(destChains.length);
    expect(fees.every((fee) => fee.gt(0))).toBe(true);
  });
});
