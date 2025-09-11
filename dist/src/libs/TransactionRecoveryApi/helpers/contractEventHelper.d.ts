import { Interface } from "@ethersproject/abi";
import { ethers } from "ethers";
import { EventLog } from "../../types";
import { EvmChain } from "../../../constants/EvmChain";
export declare function getDestinationChainFromTxReceipt(receipt: ethers.providers.TransactionReceipt): Nullable<EvmChain>;
export declare function getLogIndexFromTxReceipt(receipt: ethers.providers.TransactionReceipt): Nullable<number>;
export declare function getEventIndexFromTxReceipt(receipt: ethers.providers.TransactionReceipt): Nullable<number>;
export declare function isContractCallWithToken(receipt: ethers.providers.TransactionReceipt): boolean;
export declare function getContractCallEvent(receipt: ethers.providers.TransactionReceipt): Nullable<EventLog>;
export declare function getContractCallWithTokenEvent(receipt: ethers.providers.TransactionReceipt): Nullable<EventLog>;
export declare function getNativeGasPaidForContractCallEvent(receipt: ethers.providers.TransactionReceipt): Nullable<EventLog>;
export declare function getNativeGasPaidForContractCallWithTokenEvent(receipt: ethers.providers.TransactionReceipt): Nullable<EventLog>;
export declare function validateContractCallWithToken(gatewayEvent: EventLog, gasReceiverEvent: EventLog): boolean;
export declare function validateContractCall(gatewayEvent: EventLog, gasReceiverEvent: EventLog): boolean;
export declare function getNativeGasAmountFromTxReceipt(receipt: ethers.providers.TransactionReceipt): Nullable<string>;
export declare function getGasAmountFromTxReceipt(receipt: ethers.providers.TransactionReceipt): Nullable<string>;
export declare function findContractEvent(receipt: ethers.providers.TransactionReceipt, eventSignatures: string[], abiInterface: Interface): Nullable<EventLog>;
//# sourceMappingURL=contractEventHelper.d.ts.map