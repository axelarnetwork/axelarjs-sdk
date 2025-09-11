"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAxelarExecutable = void 0;
exports.IAxelarExecutable = {
    _format: "hh-sol-artifact-1",
    contractName: "IAxelarExecutable",
    sourceName: "contracts/interfaces/IAxelarExecutable.sol",
    abi: [
        {
            inputs: [],
            name: "NotApprovedByGateway",
            type: "error",
        },
        {
            inputs: [
                {
                    internalType: "bytes32",
                    name: "commandId",
                    type: "bytes32",
                },
                {
                    internalType: "string",
                    name: "sourceChain",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "sourceAddress",
                    type: "string",
                },
                {
                    internalType: "bytes",
                    name: "payload",
                    type: "bytes",
                },
            ],
            name: "execute",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "bytes32",
                    name: "commandId",
                    type: "bytes32",
                },
                {
                    internalType: "string",
                    name: "sourceChain",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "sourceAddress",
                    type: "string",
                },
                {
                    internalType: "bytes",
                    name: "payload",
                    type: "bytes",
                },
                {
                    internalType: "string",
                    name: "tokenSymbol",
                    type: "string",
                },
                {
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "executeWithToken",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "gateway",
            outputs: [
                {
                    internalType: "contract IAxelarGateway",
                    name: "",
                    type: "address",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
    ],
    bytecode: "0x",
    deployedBytecode: "0x",
    linkReferences: {},
    deployedLinkReferences: {},
};
exports.default = exports.IAxelarExecutable;
//# sourceMappingURL=IAxelarExecutable.js.map