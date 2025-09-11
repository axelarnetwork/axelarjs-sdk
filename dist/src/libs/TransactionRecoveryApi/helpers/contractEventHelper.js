"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDestinationChainFromTxReceipt = getDestinationChainFromTxReceipt;
exports.getLogIndexFromTxReceipt = getLogIndexFromTxReceipt;
exports.getEventIndexFromTxReceipt = getEventIndexFromTxReceipt;
exports.isContractCallWithToken = isContractCallWithToken;
exports.getContractCallEvent = getContractCallEvent;
exports.getContractCallWithTokenEvent = getContractCallWithTokenEvent;
exports.getNativeGasPaidForContractCallEvent = getNativeGasPaidForContractCallEvent;
exports.getNativeGasPaidForContractCallWithTokenEvent = getNativeGasPaidForContractCallWithTokenEvent;
exports.validateContractCallWithToken = validateContractCallWithToken;
exports.validateContractCall = validateContractCall;
exports.getNativeGasAmountFromTxReceipt = getNativeGasAmountFromTxReceipt;
exports.getGasAmountFromTxReceipt = getGasAmountFromTxReceipt;
exports.findContractEvent = findContractEvent;
const abi_1 = require("@ethersproject/abi");
const ethers_1 = require("ethers");
function getDestinationChainFromTxReceipt(receipt) {
    const signatureContractCallWithToken = ethers_1.ethers.utils.id("ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)");
    const signatureContractCall = ethers_1.ethers.utils.id("ContractCall(address,string,string,bytes32,bytes)");
    const event = findContractEvent(receipt, [signatureContractCall, signatureContractCallWithToken], new abi_1.Interface([
        "event ContractCallWithToken(address indexed sender, string destinationChain, string destinationContractAddress, bytes32 indexed payloadHash, bytes payload, string symbol, uint256 amount)",
        "event ContractCall(address indexed sender,string destinationChain,string destinationContractAddress,bytes32 indexed payloadHash,bytes payload)",
    ]));
    return event === null || event === void 0 ? void 0 : event.eventLog.args[1].toLowerCase();
}
function getLogIndexFromTxReceipt(receipt) {
    const contractCallEvent = getContractCallEvent(receipt);
    const contractCallWithTokenEvent = getContractCallWithTokenEvent(receipt);
    return (contractCallEvent === null || contractCallEvent === void 0 ? void 0 : contractCallEvent.logIndex) || (contractCallEvent === null || contractCallEvent === void 0 ? void 0 : contractCallEvent.logIndex) === 0
        ? contractCallEvent.logIndex
        : contractCallWithTokenEvent === null || contractCallWithTokenEvent === void 0 ? void 0 : contractCallWithTokenEvent.logIndex;
}
function getEventIndexFromTxReceipt(receipt) {
    const contractCallEvent = getContractCallEvent(receipt);
    const contractCallWithTokenEvent = getContractCallWithTokenEvent(receipt);
    return (contractCallEvent === null || contractCallEvent === void 0 ? void 0 : contractCallEvent.eventIndex) || (contractCallEvent === null || contractCallEvent === void 0 ? void 0 : contractCallEvent.eventIndex) === 0
        ? contractCallEvent.eventIndex
        : contractCallWithTokenEvent === null || contractCallWithTokenEvent === void 0 ? void 0 : contractCallWithTokenEvent.eventIndex;
}
function isContractCallWithToken(receipt) {
    return !!getContractCallWithTokenEvent(receipt);
}
function getContractCallEvent(receipt) {
    const signatureContractCall = ethers_1.ethers.utils.id("ContractCall(address,string,string,bytes32,bytes)");
    return findContractEvent(receipt, [signatureContractCall], new abi_1.Interface([
        "event ContractCall(address indexed sender,string destinationChain,string destinationContractAddress,bytes32 indexed payloadHash,bytes payload)",
    ]));
}
function getContractCallWithTokenEvent(receipt) {
    const signatureContractCallWithToken = ethers_1.ethers.utils.id("ContractCallWithToken(address,string,string,bytes32,bytes,string,uint256)");
    return findContractEvent(receipt, [signatureContractCallWithToken], new abi_1.Interface([
        "event ContractCallWithToken(address indexed sender, string destinationChain, string destinationContractAddress, bytes32 indexed payloadHash, bytes payload, string symbol, uint256 amount)",
    ]));
}
function getNativeGasPaidForContractCallEvent(receipt) {
    const signatureGasPaidContractCall = ethers_1.ethers.utils.id("NativeGasPaidForContractCall(address,string,string,bytes32,uint256,address)");
    return findContractEvent(receipt, [signatureGasPaidContractCall], new abi_1.Interface([
        "event NativeGasPaidForContractCall(address indexed sourceAddress,string destinationChain,string destinationAddress,bytes32 indexed payloadHash,uint256 gasFeeAmount,address refundAddress)",
    ]));
}
function getNativeGasPaidForContractCallWithTokenEvent(receipt) {
    const signatureGasPaidContractCallWithToken = ethers_1.ethers.utils.id("NativeGasPaidForContractCallWithToken(address,string,string,bytes32,string,uint256,uint256,address)");
    return findContractEvent(receipt, [signatureGasPaidContractCallWithToken], new abi_1.Interface([
        "event NativeGasPaidForContractCallWithToken(address indexed sourceAddress,string destinationChain,string destinationAddress,bytes32 indexed payloadHash,string symbol,uint256 amount,uint256 gasFeeAmount,address refundAddress)",
    ]));
}
function validateContractCallWithToken(gatewayEvent, gasReceiverEvent) {
    return (gatewayEvent.eventLog.args.sender === gasReceiverEvent.eventLog.args.sourceAddress &&
        gatewayEvent.eventLog.args.destinationChain ===
            gasReceiverEvent.eventLog.args.destinationChain &&
        gatewayEvent.eventLog.args.destinationContractAddress ===
            gasReceiverEvent.eventLog.args.destinationAddress &&
        gatewayEvent.eventLog.args.payloadHash === gasReceiverEvent.eventLog.args.payloadHash &&
        gatewayEvent.eventLog.args.symbol === gasReceiverEvent.eventLog.args.symbol &&
        gatewayEvent.eventLog.args.amount.toString() ===
            gasReceiverEvent.eventLog.args.amount.toString());
}
function validateContractCall(gatewayEvent, gasReceiverEvent) {
    return (gatewayEvent.eventLog.args.sender === gasReceiverEvent.eventLog.args.sourceAddress &&
        gatewayEvent.eventLog.args.destinationChain ===
            gasReceiverEvent.eventLog.args.destinationChain &&
        gatewayEvent.eventLog.args.destinationContractAddress ===
            gasReceiverEvent.eventLog.args.destinationAddress &&
        gatewayEvent.eventLog.args.payloadHash === gasReceiverEvent.eventLog.args.payloadHash);
}
function getNativeGasAmountFromTxReceipt(receipt) {
    const typeContractCallWithToken = isContractCallWithToken(receipt);
    let gasReceiverEvent, gatewayEvent;
    if (typeContractCallWithToken) {
        gasReceiverEvent = getNativeGasPaidForContractCallWithTokenEvent(receipt);
        gatewayEvent = getContractCallWithTokenEvent(receipt);
        if (gasReceiverEvent &&
            gatewayEvent &&
            validateContractCallWithToken(gatewayEvent, gasReceiverEvent)) {
            return gasReceiverEvent === null || gasReceiverEvent === void 0 ? void 0 : gasReceiverEvent.eventLog.args.gasFeeAmount.toString();
        }
        else {
            return "0";
        }
    }
    else {
        gasReceiverEvent = getNativeGasPaidForContractCallEvent(receipt);
        gatewayEvent = getContractCallEvent(receipt);
        if (gasReceiverEvent && gatewayEvent && validateContractCall(gatewayEvent, gasReceiverEvent)) {
            return gasReceiverEvent === null || gasReceiverEvent === void 0 ? void 0 : gasReceiverEvent.eventLog.args.gasFeeAmount.toString();
        }
        else {
            return "0";
        }
    }
}
function getGasAmountFromTxReceipt(receipt) {
    const signatureGasPaidContractCallWithToken = ethers_1.ethers.utils.id("GasPaidForContractCallWithToken(address,string,string,bytes32,string,uint256,address,uint256,address)");
    const signatureGasPaidContractCall = ethers_1.ethers.utils.id("GasPaidForContractCall(address,string,string,bytes32,uint256,uint256,address)");
    const event = findContractEvent(receipt, [signatureGasPaidContractCall, signatureGasPaidContractCallWithToken], new abi_1.Interface([
        "event GasPaidForContractCallWithToken(address indexed sourceAddress,string destinationChain,string destinationAddress,bytes32 indexed payloadHash,string symbol,uint256 amount,address gasToken,uint256 gasFeeAmount,address refundAddress)",
        "event GasPaidForContractCall(address indexed sourceAddress,string destinationChain,string destinationAddress,bytes32 indexed payloadHash,address gasToken,uint256 gasFeeAmount,address refundAddress)",
    ]));
    return event === null || event === void 0 ? void 0 : event.eventLog.args.slice(-2)[0].toString();
}
function findContractEvent(receipt, eventSignatures, abiInterface) {
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
//# sourceMappingURL=contractEventHelper.js.map