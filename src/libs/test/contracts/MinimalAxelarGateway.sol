// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

contract MinimalAxelarGateway {
  event TokenSent(
    address indexed sender,
    string indexed destinationChain,
    string indexed destinationAddress,
    string symbol,
    uint256 amount
  );

  event ContractCall(
    address indexed sender,
    string indexed destinationChain,
    string contractAddress,
    bytes32 indexed payloadHash,
    bytes payload
  );

  event ContractCallWithToken(
    address indexed sender,
    string indexed destinationChain,
    string contractAddress,
    bytes32 indexed payloadHash,
    bytes payload,
    string symbol,
    uint256 amount
  );

  constructor() {}

  /******************\
    |* Public Methods *|
    \******************/

  function sendToken(
    string memory destinationChain,
    string memory destinationAddress,
    string memory symbol,
    uint256 amount
  ) external {
    emit TokenSent(
      msg.sender,
      destinationChain,
      destinationAddress,
      symbol,
      amount
    );
  }

  function callContract(
    string memory destinationChain,
    string memory contractAddress,
    bytes memory payload
  ) external {
    emit ContractCall(
      msg.sender,
      destinationChain,
      contractAddress,
      keccak256(payload),
      payload
    );
  }

  function callContractWithToken(
    string memory destinationChain,
    string memory destinationAddress,
    bytes memory payload,
    string memory symbol,
    uint256 amount
  ) external {
    emit ContractCallWithToken(
      msg.sender,
      destinationChain,
      destinationAddress,
      keccak256(payload),
      payload,
      symbol,
      amount
    );
  }

  /***********\
    |* Getters *|
    \***********/
  function tokenAddresses(string memory symbol) public pure returns (address) {
    return address(uint160(bytes20(bytes(symbol))));
  }

  function tokenFrozen(string memory symbol) public pure returns (bool) {
    if (keccak256(bytes(symbol)) == keccak256(bytes("ICE"))) {
      return true;
    } else {
      return false;
    }
  }

  function isCommandExecuted(bytes32 commandId) public pure returns (bool) {
    // byted32 string "executed"
    if (commandId == bytes32("executed")) {
      return true;
    } else {
      return false;
    }
  }
}
