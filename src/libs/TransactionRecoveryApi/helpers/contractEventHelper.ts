import { Interface } from "@ethersproject/abi";
import { ethers } from "ethers";
import AxelarGateway from "../../abi/axelarGatewayAbi.json";
import IAxelarGasService from "../../abi/IAxelarGasService.json";
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
    new Interface(AxelarGateway)
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
    new Interface(AxelarGateway)
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
    new Interface(IAxelarGasService)
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
    new Interface(IAxelarGasService)
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
