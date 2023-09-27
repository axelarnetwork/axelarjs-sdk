import { Interface } from "@ethersproject/abi";
import { ethers } from "ethers";
import { EventLog } from "../../types";
import { EvmChain } from "../../../constants/EvmChain";

export function getDestinationChainFromTxReceipt(
  receipt: ethers.providers.TransactionReceipt
): Nullable<EvmChain> {
  const signatureContractCallWithToken = ethers.utils.id(
    "ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)"
  );
  const signatureContractCall = ethers.utils.id(
    "ContractCall(address,string,string,bytes32,bytes)"
  );
  const event = findContractEvent(
    receipt,
    [signatureContractCall, signatureContractCallWithToken],
    new Interface([
      "event ContractCallWithToken(address indexed sender, string destinationChain, string destinationContractAddress, bytes32 indexed payloadHash, bytes payload, string symbol, uint256 amount)",
      "event ContractCall(address indexed sender,string destinationChain,string destinationContractAddress,bytes32 indexed payloadHash,bytes payload)",
    ])
  );
  return event?.eventLog.args[1].toLowerCase();
}

export function getLogIndexFromTxReceipt(
  receipt: ethers.providers.TransactionReceipt
): Nullable<number> {
  const contractCallEvent = getContractCallEvent(receipt);
  const contractCallWithTokenEvent = getContractCallWithTokenEvent(receipt);
  return contractCallEvent?.logIndex || contractCallEvent?.logIndex === 0
    ? contractCallEvent.logIndex
    : contractCallWithTokenEvent?.logIndex;
}

export function getEventIndexFromTxReceipt(
  receipt: ethers.providers.TransactionReceipt
): Nullable<number> {
  const contractCallEvent = getContractCallEvent(receipt);
  const contractCallWithTokenEvent = getContractCallWithTokenEvent(receipt);
  return contractCallEvent?.eventIndex || contractCallEvent?.eventIndex === 0
    ? contractCallEvent.eventIndex
    : contractCallWithTokenEvent?.eventIndex;
}

export function isContractCallWithToken(receipt: ethers.providers.TransactionReceipt): boolean {
  return !!getContractCallWithTokenEvent(receipt);
}

export function getContractCallEvent(
  receipt: ethers.providers.TransactionReceipt
): Nullable<EventLog> {
  const signatureContractCall = ethers.utils.id(
    "ContractCall(address,string,string,bytes32,bytes)"
  );
  return findContractEvent(
    receipt,
    [signatureContractCall],
    new Interface([
      "event ContractCall(address indexed sender,string destinationChain,string destinationContractAddress,bytes32 indexed payloadHash,bytes payload)",
    ])
  );
}

export function getContractCallWithTokenEvent(
  receipt: ethers.providers.TransactionReceipt
): Nullable<EventLog> {
  const signatureContractCallWithToken = ethers.utils.id(
    "ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)"
  );
  return findContractEvent(
    receipt,
    [signatureContractCallWithToken],
    new Interface([
      "event ContractCallWithToken(address indexed sender, string destinationChain, string destinationContractAddress, bytes32 indexed payloadHash, bytes payload, string symbol, uint256 amount)",
    ])
  );
}

export function getNativeGasPaidForContractCallEvent(receipt: ethers.providers.TransactionReceipt) {
  const signatureGasPaidContractCall = ethers.utils.id(
    "NativeGasPaidForContractCall(address,string,string,bytes32,uint256,address)"
  );
  return findContractEvent(
    receipt,
    [signatureGasPaidContractCall],
    new Interface([
      "event NativeGasPaidForContractCall(address indexed sourceAddress,string destinationChain,string destinationAddress,bytes32 indexed payloadHash,uint256 gasFeeAmount,address refundAddress)",
    ])
  );
}

export function getNativeGasPaidForContractCallWithTokenEvent(
  receipt: ethers.providers.TransactionReceipt
) {
  const signatureGasPaidContractCallWithToken = ethers.utils.id(
    "NativeGasPaidForContractCallWithToken(address,string,string,bytes32,string,uint256,uint256,address)"
  );
  return findContractEvent(
    receipt,
    [signatureGasPaidContractCallWithToken],
    new Interface([
      "event NativeGasPaidForContractCallWithToken(address indexed sourceAddress,string destinationChain,string destinationAddress,bytes32 indexed payloadHash,string symbol,uint256 amount,uint256 gasFeeAmount,address refundAddress)",
    ])
  );
}

export function validateContractCallWithToken(gatewayEvent: EventLog, gasReceiverEvent: EventLog) {
  return (
    gatewayEvent.eventLog.args.sender === gasReceiverEvent.eventLog.args.sourceAddress &&
    gatewayEvent.eventLog.args.destinationChain ===
      gasReceiverEvent.eventLog.args.destinationChain &&
    gatewayEvent.eventLog.args.destinationContractAddress ===
      gasReceiverEvent.eventLog.args.destinationAddress &&
    gatewayEvent.eventLog.args.payloadHash === gasReceiverEvent.eventLog.args.payloadHash &&
    gatewayEvent.eventLog.args.symbol === gasReceiverEvent.eventLog.args.symbol &&
    gatewayEvent.eventLog.args.amount.toString() ===
      gasReceiverEvent.eventLog.args.amount.toString()
  );
}

export function validateContractCall(gatewayEvent: EventLog, gasReceiverEvent: EventLog) {
  return (
    gatewayEvent.eventLog.args.sender === gasReceiverEvent.eventLog.args.sourceAddress &&
    gatewayEvent.eventLog.args.destinationChain ===
      gasReceiverEvent.eventLog.args.destinationChain &&
    gatewayEvent.eventLog.args.destinationContractAddress ===
      gasReceiverEvent.eventLog.args.destinationAddress &&
    gatewayEvent.eventLog.args.payloadHash === gasReceiverEvent.eventLog.args.payloadHash
  );
}

export function getNativeGasAmountFromTxReceipt(
  receipt: ethers.providers.TransactionReceipt
): Nullable<string> {
  const typeContractCallWithToken = isContractCallWithToken(receipt);
  let gasReceiverEvent, gatewayEvent;
  if (typeContractCallWithToken) {
    gasReceiverEvent = getNativeGasPaidForContractCallWithTokenEvent(receipt);
    gatewayEvent = getContractCallWithTokenEvent(receipt);

    if (
      gasReceiverEvent &&
      gatewayEvent &&
      validateContractCallWithToken(gatewayEvent, gasReceiverEvent)
    ) {
      return gasReceiverEvent?.eventLog.args.gasFeeAmount.toString();
    } else {
      return "0";
    }
  } else {
    gasReceiverEvent = getNativeGasPaidForContractCallEvent(receipt);
    gatewayEvent = getContractCallEvent(receipt);

    if (gasReceiverEvent && gatewayEvent && validateContractCall(gatewayEvent, gasReceiverEvent)) {
      return gasReceiverEvent?.eventLog.args.gasFeeAmount.toString();
    } else {
      return "0";
    }
  }
}

export function getGasAmountFromTxReceipt(
  receipt: ethers.providers.TransactionReceipt
): Nullable<string> {
  const signatureGasPaidContractCallWithToken = ethers.utils.id(
    "GasPaidForContractCallWithToken(address,string,string,bytes32,string,uint256,address,uint256,address)"
  );
  const signatureGasPaidContractCall = ethers.utils.id(
    "GasPaidForContractCall(address,string,string,bytes32,uint256,uint256,address)"
  );

  const event = findContractEvent(
    receipt,
    [signatureGasPaidContractCall, signatureGasPaidContractCallWithToken],
    new Interface([
      "event GasPaidForContractCallWithToken(address indexed sourceAddress,string destinationChain,string destinationAddress,bytes32 indexed payloadHash,string symbol,uint256 amount,address gasToken,uint256 gasFeeAmount,address refundAddress)",
      "event GasPaidForContractCall(address indexed sourceAddress,string destinationChain,string destinationAddress,bytes32 indexed payloadHash,address gasToken,uint256 gasFeeAmount,address refundAddress)",
    ])
  );
  return event?.eventLog.args.slice(-2)[0].toString();
}

export function findContractEvent(
  receipt: ethers.providers.TransactionReceipt,
  eventSignatures: string[],
  abiInterface: Interface
): Nullable<EventLog> {
  for (const [index, log] of receipt.logs.entries()) {
    const eventIndex = eventSignatures.indexOf(log.topics[0]);
    if (eventIndex > -1) {
      const eventLog = abiInterface.parseLog(log);
      return {
        signature: eventSignatures[eventIndex],
        eventLog,
        logIndex: log.logIndex,
        eventIndex: index,
      };
    }
  }
}
