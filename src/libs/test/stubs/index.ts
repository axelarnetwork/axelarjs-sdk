import { BigNumber } from "ethers";
import Long from "long";
import { EvmChain } from "../../../constants/EvmChain";

export const uuidStub = () => "83462f97-63cf-4205-a659-6f54bec623f6";

export const ethAddressStub = () => "0xF16DfB26e1FEc993E085092563ECFAEaDa7eD7fD";

export const terraAddressStub = () => "terra1qem4njhac8azalrav7shvp06myhqldpmkk3p0t";

export const activeChainsStub = () => [
  "agoric",
  "assetmantle",
  "aurora",
  "avalanche",
  "axelarnet",
  "binance",
  "comdex",
  "cosmoshub",
  "crescent",
  "e-money",
  "ethereum",
  "evmos",
  "fantom",
  "fetch",
  "injective",
  "juno",
  "ki",
  "kujira",
  "moonbeam",
  "osmosis",
  "polygon",
  "regen",
  "secret",
  "stargaze",
  "terra-3",
  "umee",
  "base",
];

export const otcStub = () => ({
  otc: "hr64_XnjNE",
  validationMsg:
    "Verify I'm a real user with this one-time-code: hr64_XnjNE (This will not cost any fees)",
});

export const batchCommandStub = () => ({
  data: "mockedData",
  status: "mockedStatus",
  key_id: "mockedKeyId",
  execute_data: "mockedExecuteData",
  prev_batched_commands_id: "mockedPrevBatchedCommandsId",
  command_ids: ["mockedCommandId1", "mockedCommandId2"],
  batch_id: "mockedBatchId",
  chain: "mockedChain",
  id: "mockedId",
});

export const findEventAndConfirmStub = () => ({
  success: true,
  errorMessage: undefined,
  infoLogs: ["Log 1", "Log 2", "Log 3"],
  commandId: "commandId",
  confirmTx: axelarTxResponseStub(),
  eventResponse: evmEventStubResponse().eventResponse,
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
  fromChain: "terra-3",
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
  srcTxInfo: {
    transactionHash: "0x",
    transactionIndex: 0,
    logIndex: 0,
  },
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

export const evmEventStubResponse = () => ({
  success: true,
  errorMessage: "",
  commandId: "commandId",
  infoLog: "",
  eventResponse: {
    event: {
      chain: "Moonbeam",
      txId: new Uint8Array(),
      index: Long.fromNumber(1),
      status: 2,
      tokenSent: undefined,
      contractCall: undefined,
      contractCallWithToken: undefined,
      transfer: undefined,
      tokenDeployed: undefined,
      multisigOwnershipTransferred: undefined,
      multisigOperatorshipTransferred: undefined,
    },
  },
});

export const chainInfoStub = () => ({
  id: "mockedId",
  assets: [],
  rpc: [],
  chainSymbol: "mockedSymbol",
  chainName: "mockedName",
  fullySupported: true,
  estimatedWaitTime: 10,
  txFeeInPercent: 0.1,
  module: "axelarnet",
  chainIdentifier: {
    "devnet-amplifier": "mockedDevnet",
    testnet: "mockedTestnet",
    mainnet: "mockedMainnet",
  },
  nativeAsset: ["mockedNativeAsset"],
  addressPrefix: "mockedPrefix",
  confirmLevel: 1,
});

export const axelarTxResponseStub = (rawLog: any = []) => ({
  height: 1,
  code: 0,
  transactionHash: "0x",
  rawLog,
  gasUsed: 1,
  gasWanted: 1,
  events: [],
  msgResponses: [],
  txIndex: 1,
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

export const transferResponseExecutedStub = () => {
  return [
    {
      source: {
        id: "6D1B1CD4B754280461BD7AD43B4838BBD8A467AA346B7584052025F83B5EB90F",
        type: "axelarnet_transfer",
        status_code: 0,
        status: "success",
        height: 3797679,
        created_at: {
          ms: 1662383903000,
          hour: 1662382800000,
          day: 1662336000000,
          week: 1662249600000,
          month: 1661990400000,
          quarter: 1656633600000,
          year: 1640995200000,
        },
        sender_chain: "axelarnet",
        sender_address: "axelar1d4v2fad26kze27s9przdc6zrcyxqsj20vas39m",
        recipient_address: "axelar1xc8h95qg6lq7wlzq987v0xkxlpjwzlph928ylsdjggp9vaavjk0s5ll8zy",
        amount: 1,
        denom: "uausdc",
        original_sender_chain: "axelarnet",
        original_recipient_chain: "ethereum",
        recipient_chain: "ethereum",
        fee: 0.15,
        amount_received: 0.85,
        value: 1.0000013247208923,
      },
      link: {
        recipient_chain: "ethereum",
        denom: "uausdc",
        txhash: "59967335356EC79EBC6424774132777ADFE55714F1FBA6B0B6F9CE4B7994C0A7",
        height: 3797678,
        sender_chain: "axelarnet",
        deposit_address: "axelar1xc8h95qg6lq7wlzq987v0xkxlpjwzlph928ylsdjggp9vaavjk0s5ll8zy",
        type: "axelar",
        original_sender_chain: "axelarnet",
        original_recipient_chain: "ethereum",
        sender_address: "axelar1d4v2fad26kze27s9przdc6zrcyxqsj20vas39m",
        recipient_address: "0xb357203c359863c613968f93ea2b38313be99de5",
        price: 1.0000013247208923,
        id: "axelar1xc8h95qg6lq7wlzq987v0xkxlpjwzlph928ylsdjggp9vaavjk0s5ll8zy",
      },
      confirm_deposit: {
        amount: "1000000",
        status_code: 0,
        recipient_chain: "ethereum",
        module: "axelarnet",
        deposit_address: "axelar1xc8h95qg6lq7wlzq987v0xkxlpjwzlph928ylsdjggp9vaavjk0s5ll8zy",
        created_at: {
          week: 1662249600000,
          hour: 1662382800000,
          month: 1661990400000,
          year: 1640995200000,
          ms: 1662383909000,
          day: 1662336000000,
          quarter: 1656633600000,
        },
        transfer_id: 54161,
        type: "ConfirmDeposit",
        sender_chain: "axelarnet",
        id: "0C19D58E47688A5AABECB3D9738157D01A1FD6DB0CCB23E271902E4FA2A00C86",
        denom: "uausdc",
        user: "axelar1qhpndlkxgpuraujqe3llmks7mk6u8sghgdkq8k",
        status: "success",
        height: 3797680,
      },
      sign_batch: {
        chain: "ethereum",
        command_id: "000000000000000000000000000000000000000000000000000000000000d391",
        logIndex: 3,
        batch_id: "10818f6d7950a7d66bbe1b6f4079a87526d398894054fb35f36bab6fbbed0d15",
        block_timestamp: 1662384108,
        created_at: {
          week: 1662249600000,
          hour: 1662382800000,
          month: 1661990400000,
          year: 1640995200000,
          ms: 1662384085000,
          day: 1662336000000,
          quarter: 1656633600000,
        },
        executed: true,
        transactionIndex: 83,
        transfer_id: 54161,
        transactionHash: "0x6890f067130855475015db6094ef493147cda4897e28a84890d13da68f4264a4",
      },
      id: "6d1b1cd4b754280461bd7ad43b4838bbd8a467aa346b7584052025f83b5eb90f_axelar1xc8h95qg6lq7wlzq987v0xkxlpjwzlph928ylsdjggp9vaavjk0s5ll8zy",
      status: "executed",
    },
  ];
};

export const getFeeStub = () => ({
  method: "getFees",
  params: {
    method: "getFees",
    sourceChain: "avalanche",
    destinationChain: "ethereum",
    sourceTokenAddress: "0x0000000000000000000000000000000000000000",
  },
  result: {
    base_fee: 0.418869692086198,
    source_token: {
      contract_address: "0x0000000000000000000000000000000000000000",
      symbol: "AVAX",
      name: "Avalanche",
      decimals: 18,
      token_price: {
        usd: 20.56,
      },
      gas_price: "0.000001893353954513",
    },
    source_base_fee: 0.418869692086198,
    source_base_fee_string: "0.418869692086198",
    destination_native_token: {
      contract_address: "0x0000000000000000000000000000000000000000",
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      token_price: {
        usd: 1674.72,
      },
      gas_price: "0.000000023244098897",
    },
    destination_base_fee: 0.00514232878886753,
  },
  time_spent: 310,
});
