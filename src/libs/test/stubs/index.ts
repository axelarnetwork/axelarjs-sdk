import { BigNumber } from "ethers";
import { EvmChain } from "../../types";

export const uuidStub = () => "83462f97-63cf-4205-a659-6f54bec623f6";

export const ethAddressStub = () => "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";

export const terraAddressStub = () => "terra1qem4njhac8azalrav7shvp06myhqldpmkk3p0t";

export const otcStub = () => ({
  otc: "hr64_XnjNE",
  validationMsg:
    "Verify I'm a real user with this one-time-code: hr64_XnjNE (This will not cost any fees)",
});

export const apiErrorStub = () => ({
  message: "AxelarJS-SDK uncaught post error",
  uncaught: true,
  fullMessage: "",
});

export const roomIdStub = () => ({
  roomId:
    '{"assetCommonKey":"uusd","destinationAddress":"0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD","destinationChainIdentifier":"avalanche","sourceModule":"axelarnet","type":"link"}',
});

export const depositAddressPayloadStub = () => ({
  fromChain: "terra",
  toChain: "avalanche",
  asset: "uusd",
  publicAddress: ethAddressStub(),
  destinationAddress: ethAddressStub(),
  signature: "0x",
});

export const linkEventStub = () => ({
  Type: "link",
  Attributes: {
    asset: "uusd",
    depositAddress: "axelar1ncj6rh3fxzx6pz35gjc6fva534vqmpsx3pwj8s8uyrqrthrch4asgu5l0p",
    destinationAddress: "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD",
    destinationChain: "Avalanche",
    module: "axelarnet",
    sourceChain: "Axelarnet",
  },
  Height: 1502111,
  newRoomId:
    '{"depositAddress":"axelar1ncj6rh3fxzx6pz35gjc6fva534vqmpsx3pwj8s8uyrqrthrch4asgu5l0p","sourceModule":"axelarnet","type":"deposit-confirmation"}',
});

export const newRoomIdStub = () =>
  '{"depositAddress":"axelar1ncj6rh3fxzx6pz35gjc6fva534vqmpsx3pwj8s8uyrqrthrch4asgu5l0p","sourceModule":"axelarnet","type":"deposit-confirmation"}';

export const executeParamsStub = () => ({
  commandId: "0xdfeb4a182f0f1d262e82ed36968eaa636fd52de400c886b05060255c57b32d6f",
  destinationChain: EvmChain.AVALANCHE,
  destinationContractAddress: "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD",
  isContractCallWithToken: true,
  payload: "0x",
  sourceAddress: "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD",
  sourceChain: EvmChain.FANTOM,
  amount: "1",
  symbol: "WAVAX",
});

export const contractReceiptStub = () => ({
  transactionHash: "0x739024d5cae44f63669beb1df9512348c2c4b19caf827de66d74c32fe24ee2a0",
  blockHash: "0x4f5018f52584d798e6145f6998ea1fc9b7716d89653db25960188f9437189620",
  from: "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD",
  to: "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD",
  confirmations: 1,
  gasUsed: BigNumber.from("1"),
  effectiveGasPrice: BigNumber.from("1"),
  cumulativeGasUsed: BigNumber.from("1"),
  logs: [],
  logsBloom: "",
  contractAddress: "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD",
  byzantium: true,
  blockNumber: 1,
  type: 0,
  transactionIndex: 1,
});

export const axelarTxResponseStub = (rawLog: any = []) => ({
  height: 1,
  code: 0,
  transactionHash: "0x",
  rawLog,
  gasUsed: 1,
  gasWanted: 1,
});

export const batchedCommandResponseStub = (executeData = "") => ({
  executeData,
  id: "",
  status: 1,
  data: "",
  keyId: "",
  signature: [],
  prevBatchedCommandsId: "",
  commandIds: [],
});
