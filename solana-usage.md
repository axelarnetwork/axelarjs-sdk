# Solana Add Gas Usage Guide

This document provides usage examples for the `addGasToSolanaChain` function in the Axelar SDK.

**Note**: This implementation has been updated to match the actual Solana program structure with proper Borsh serialization.

## Core Logic

```typescript
import { AxelarGMPRecoveryAPI, Environment } from '@axelar-network/axelarjs-sdk';
import { Connection, Transaction, TransactionInstruction, PublicKey } from '@solana/web3.js';

// Initialize SDK
const recoveryAPI = new AxelarGMPRecoveryAPI({
  environment: Environment.TESTNET // or Environment.MAINNET
});

// Core function to add gas
async function addGasToSolana(
  txHash: string,           // 64-byte transaction hash from original cross-chain tx
  logIndex: number,         // Log index (usually 0)
  gasFeeAmount: string,     // Amount in lamports (1 SOL = 1e9 lamports)
  sender: string,           // Sender's Solana wallet address (must be signer)
  refundAddress: string,    // Refund address (can be different from sender)
  programId: string,        // REQUIRED: Axelar Solana gas service program ID
  configPda: string,        // REQUIRED: Config PDA address
  wallet: any,              // Wallet adapter instance
  connection: Connection    // Solana connection
): Promise<string> {
  
  // Get instruction from SDK
  const instructionData = await recoveryAPI.addGasToSolanaChain({
    txHash,
    logIndex,
    gasFeeAmount,
    sender,         // The wallet that pays for gas (must sign)
    refundAddress,  // Where refunds are sent (in instruction data)
    programId,      // Now required
    configPda,      // Now required
  });

  // Create Solana instruction  
  const instruction = new TransactionInstruction({
    programId: new PublicKey(instructionData.programId),
    keys: instructionData.accounts.map(account => ({
      pubkey: new PublicKey(account.pubkey),
      isSigner: account.isSigner,
      isWritable: account.isWritable,
    })),
    data: Buffer.from(instructionData.data),
  });

  // Send transaction
  const transaction = new Transaction().add(instruction);
  const signature = await wallet.sendTransaction(transaction, connection);
  
  // Wait for confirmation
  await connection.confirmTransaction(signature);
  
  return signature;
}
```

## Type Definitions

```typescript
// Parameters for the add gas function
export interface AddGasSolanaParams {
  txHash: string;        // 64-byte transaction hash (hex string)
  logIndex: number;      // Log index for the transaction (will be converted to u64)
  gasFeeAmount: string;  // Amount in lamports (will be converted to u64)
  sender: string;        // Sender's Solana wallet address (base58 string) - must be signer
  refundAddress: string; // Refund address (base58 string) - goes in instruction data
  configPda: string;     // Config PDA address (REQUIRED, base58 string)
  programId: string;     // Axelar Solana gas service program ID (REQUIRED, base58 string)
}

// Return type
export interface SolanaInstruction {
  programId: string;
  accounts: Array<{
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }>;
  data: Uint8Array;
}
```

## Usage Example

```typescript
// Configuration - Must be obtained from Axelar team
const AXELAR_SOLANA_PROGRAM_ID = "YOUR_ACTUAL_PROGRAM_ID"; // Must be obtained from Axelar
const AXELAR_CONFIG_PDA = "YOUR_ACTUAL_CONFIG_PDA";       // Must be obtained from Axelar

try {
  const signature = await addGasToSolana(
    "0x1234567890abcdef...", // 64-byte tx hash from cross-chain transaction
    0,                       // log index
    "1000000000",           // 1 SOL in lamports
    userWalletAddress,      // sender's wallet (must sign the transaction)
    userWalletAddress,      // refund address (can be same as sender)
    AXELAR_SOLANA_PROGRAM_ID, // REQUIRED: Axelar Solana program ID
    AXELAR_CONFIG_PDA,        // REQUIRED: Config PDA address
    wallet,                  // Wallet adapter instance
    connection              // Solana connection
  );
  console.log('Gas added successfully. Signature:', signature);
} catch (error) {
  console.error('Error adding gas:', error);
}
```

## Utility Functions

```typescript
// Convert SOL to lamports
const solToLamports = (sol: number): string => {
  return (sol * 1e9).toString();
};

// Validate transaction hash format
const isValidTxHash = (txHash: string): boolean => {
  const cleanHash = txHash.replace('0x', '');
  return cleanHash.length === 128; // 64 bytes = 128 hex characters
};

// Example usage with utilities
const gasFeeInSol = 0.01; // 0.01 SOL
const gasFeeInLamports = solToLamports(gasFeeInSol);

if (!isValidTxHash(txHash)) {
  throw new Error('Invalid transaction hash format');
}
```

## Error Handling

```typescript
try {
  const signature = await addGasToSolana(
    txHash,
    logIndex,
    gasFeeAmount,
    sender,         // The wallet that will sign and pay
    refundAddress,  // Where refunds go (can be same as sender)
    programId,
    configPda,
    wallet,
    connection
  );
} catch (error) {
  if (error.message.includes('Program ID is required')) {
    // Handle missing program ID
    console.error('Axelar Solana program ID not configured');
  } else if (error.message.includes('Config PDA is required')) {
    // Handle missing config PDA
    console.error('Axelar config PDA not configured');
  } else if (error.message.includes('Transaction hash must be 64 bytes')) {
    // Handle invalid transaction hash
    console.error('Invalid transaction hash format');
  } else if (error.message.includes('insufficient funds')) {
    // Handle insufficient funds
    console.error('Insufficient SOL balance for gas payment');
  } else {
    // Handle other errors
    console.error('Unknown error:', error);
  }
}
```

## Required Dependencies

```bash
npm install @axelar-network/axelarjs-sdk @solana/web3.js
```

### Optional: If using Borsh library
```bash
npm install borsh
```

For React applications, also install:
```bash
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

## Important Notes

### Account Structure
- **Sender**: The wallet that pays for additional gas (must sign transaction)
- **Refund Address**: Where unused gas will be refunded (stored in instruction data)
- **Config PDA**: The program account that receives and manages gas payments

### What is a Config PDA?
A **Program Derived Address (PDA)** is a special Solana account that:
- Has no private key (only the program can control it)
- Serves as the gas service treasury (receives lamports from gas payments)
- Stores program configuration and operator information
- Is derived deterministically from seeds + program ID

### Required Configuration
- **Program ID**: Must be obtained from Axelar team/documentation
- **Config PDA**: Must be obtained from Axelar team/documentation  
- Both values are environment-specific (different for testnet vs mainnet)
- **TODO**: These will eventually be retrieved from Axelar chain configuration automatically

### Input Validation
- Transaction hash must be exactly 64 bytes (128 hex characters)
- Gas fee amount must be in lamports (1 SOL = 1,000,000,000 lamports)
- Log index is typically 0 for most transactions
- Sender and refund addresses must be valid base58 Solana addresses

### Wallet Integration
- Works with any Solana wallet adapter (Phantom, Solflare, etc.)
- Sender must have sufficient SOL balance for gas payment
- Transaction requires sender's signature
- Refund address can be different from sender

### Network Configuration
- Set environment to `TESTNET` or `MAINNET` based on deployment
- Use appropriate Solana RPC endpoint for the network
- Ensure program ID and config PDA match the network

## Action Items for Implementation

1. **Obtain Axelar Configuration**:
   - Get actual Axelar Solana program ID from Axelar team
   - Get actual config PDA address from Axelar team
   - Confirm values for both testnet and mainnet

2. **Environment Setup**:
   - Store program ID and config PDA as environment variables
   - Set up appropriate Solana RPC endpoints
   - Configure wallet adapters for your application

3. **Integration**:
   - Implement the core `addGasToSolana` function
   - Add proper error handling and user feedback
   - Test with small amounts on testnet first

4. **Testing**:
   - Validate with actual cross-chain transaction hashes
   - Test wallet connectivity and transaction signing
   - Verify gas payments are processed correctly on Axelar network