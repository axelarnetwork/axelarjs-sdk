import { StdFee } from "@cosmjs/stargate";

export const STANDARD_FEE: StdFee = {
  amount: [
    {
      denom: "uaxl",
      amount: "1000",
    },
  ],
  gas: "5000000",
};
