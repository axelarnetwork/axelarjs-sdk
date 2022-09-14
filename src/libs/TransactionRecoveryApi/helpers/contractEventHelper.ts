import { Interface } from "@ethersproject/abi";
import { ethers } from "ethers";
import { EvmChain, EventLog } from "../../types";

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
      "event ContractCallWithToken(address indexed _from, string _sourceChain, string _destinationChain, bytes32 _txHash, bytes _data, string _token, uint256 _amount)",
      "event ContractCall(address indexed sender,string destinationChain,string destinationContractAddress,bytes32 indexed payloadHash,bytes payload)",
    ])
  );
  return event?.eventLog.args[1].toLowerCase();
}

export function getLogIndexFromTxReceipt(
  receipt: ethers.providers.TransactionReceipt
): Nullable<number> {
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
      "event ContractCallWithToken(address indexed _from, string _sourceChain, string _destinationChain, bytes32 _txHash, bytes _data, string _token, uint256 _amount)",
      "event ContractCall(address indexed sender,string destinationChain,string destinationContractAddress,bytes32 indexed payloadHash,bytes payload)",
    ])
  );
  return event?.logIndex;
}

export function getNativeGasAmountFromTxReceipt(
  receipt: ethers.providers.TransactionReceipt
): Nullable<string> {
  const signatureGasPaidContractCallWithToken = ethers.utils.id(
    "NativeGasPaidForContractCallWithToken(address,string,string,bytes32,string,uint256,uint256,address)"
  );
  const signatureGasPaidContractCall = ethers.utils.id(
    "NativeGasPaidForContractCall(address,string,string,bytes32,uint256,address)"
  );

  const event = findContractEvent(
    receipt,
    [signatureGasPaidContractCall, signatureGasPaidContractCallWithToken],
    new Interface([
      "event NativeGasPaidForContractCallWithToken(address indexed _from, string _sourceChain, string _destinationChain, bytes32 _txHash, string _token, uint256 _amount, uint256 _gasUsed, address _gasToken)",
      "event NativeGasPaidForContractCall(address indexed _from, string _sourceChain, string _destinationChain, bytes32 _txHash, uint256 _gasUsed, address _gasToken)",
    ])
  );
  return event?.eventLog.args.slice(-2)[0].toString();
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
      "event GasPaidForContractCallWithToken(address indexed _from, string _sourceChain, string _destinationChain, bytes32 _txHash, string _token, uint256 _amount, address _gasToken, uint256 _gasUsed, address _gasTokenUsed)",
      "event GasPaidForContractCall(address indexed _from, string _sourceChain, string _destinationChain, bytes32 _txHash, uint256 _gasUsed, uint256 _gasTokenUsed, address _gasToken)",
    ])
  );
  return event?.eventLog.args.slice(-2)[0].toString();
}

export function findContractEvent(
  receipt: ethers.providers.TransactionReceipt,
  eventSignatures: string[],
  abiInterface: Interface
): Nullable<EventLog> {
  for (const log of receipt.logs) {
    const eventIndex = eventSignatures.indexOf(log.topics[0]);
    if (eventIndex > -1) {
      const eventLog = abiInterface.parseLog(log);
      return {
        signature: eventSignatures[eventIndex],
        eventLog,
        logIndex: log.logIndex,
      };
    }
  }
}
