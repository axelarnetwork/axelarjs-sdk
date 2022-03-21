import { AssetTransferObject } from "../../chains/types";

type GetDepositAddressOptions = {
  useMetamask?: boolean;
};

export type GetDepositAddressPayload = Omit<
  AssetTransferObject,
  "signature" | "publicAddr"
>;

export type GetDepositAddressDto = {
  payload: GetDepositAddressPayload;
  options?: GetDepositAddressOptions;
};
