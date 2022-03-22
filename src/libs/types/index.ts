type GetDepositAddressOptions = {
  useMetamask?: boolean;
};

export type GetDepositAddressPayload = {
  fromChain: string;
  toChain: string;
  asset: string;
  destinationAddress: string;
};

export type GetDepositAddressDto = {
  payload: GetDepositAddressPayload;
  options?: GetDepositAddressOptions;
};
