# Solana Add Gas Usage Example

This example shows how to use the Axelar SDK to add gas for Solana cross-chain transactions.

## Installation

```bash
npm install @axelar-network/axelarjs-sdk @solana/web3.js
```

## Usage

```typescript
import { AxelarGMPRecoveryAPI, Environment } from '@axelar-network/axelarjs-sdk';
import { Connection } from '@solana/web3.js';

// Initialize SDK
const recoveryAPI = new AxelarGMPRecoveryAPI({
  environment: Environment.TESTNET // or Environment.MAINNET
});

// Core function to add gas
async function addGasToSolana(params: {
  messageId: string;        // Format: "txHash-logIndex" (e.g., "2fftLDZ5C1HH4MojaNv37k7AE1det4YVgbRFUtx4tovy7zExNLDyvpCVHFc3sJQ12BbZuEW3zQgAyFcU7naARq1U-5")
  gasFeeAmount: string;     // Amount in lamports (1 SOL = 1e9 lamports)
  sender: string;           // Sender's Solana wallet address (must be signer)
  refundAddress: string;    // Refund address
  programId: string;        // Axelar Solana gas service program ID
  configPda: string;        // Config PDA address
  wallet: any;              // Wallet adapter instance
  connection: Connection;   // Solana connection
}): Promise<string> {
  
  const { messageId, gasFeeAmount, sender, refundAddress, programId, configPda, wallet, connection } = params;
  
  // Get transaction from SDK (returns a ready-to-use Transaction!)
  const transaction = await recoveryAPI.addGasToSolanaChain({
    messageId,      // Format: "txHash-logIndex"
    gasFeeAmount,   // Amount in lamports
    sender,         // The wallet that pays for gas
    refundAddress,  // Where refunds are sent
    programId,      // Axelar Solana gas service program ID
    configPda,      // Config PDA address
  });

  // Send transaction directly - no need to manually create instruction!
  const signature = await wallet.sendTransaction(transaction, connection);
  
  // Wait for confirmation
  await connection.confirmTransaction(signature);
  
  return signature;
}

// Example usage:
async function example() {
  const params = {
    messageId: "2fftLDZ5C1HH4MojaNv37k7AE1det4YVgbRFUtx4tovy7zExNLDyvpCVHFc3sJQ12BbZuEW3zQgAyFcU7naARq1U-5",
    gasFeeAmount: "1000000", // 0.001 SOL in lamports
    sender: "YourWalletPublicKeyBase58",
    refundAddress: "RefundAddressBase58",
    programId: "AxelarGasServiceProgramIdBase58",
    configPda: "ConfigPDABase58",
    wallet: walletAdapter, // Your wallet adapter instance
    connection: new Connection("https://api.devnet.solana.com") // or mainnet
  };
  
  try {
    const signature = await addGasToSolana(params);
    console.log('Gas added successfully! Transaction signature:', signature);
  } catch (error) {
    console.error('Error adding gas:', error);
  }
}
```

## React Component Example

```typescript
import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AxelarGMPRecoveryAPI, Environment } from '@axelar-network/axelarjs-sdk';

const SolanaAddGasComponent: React.FC = () => {
  const { connection } = useConnection();
  const { wallet, sendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const recoveryAPI = new AxelarGMPRecoveryAPI({
    environment: Environment.TESTNET
  });

  const handleAddGas = async () => {
    if (!wallet || !sendTransaction) {
      alert('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      const params = {
        messageId: "2fftLDZ5C1HH4MojaNv37k7AE1det4YVgbRFUtx4tovy7zExNLDyvpCVHFc3sJQ12BbZuEW3zQgAyFcU7naARq1U-5",
        gasFeeAmount: "1000000", // 0.001 SOL
        sender: wallet.adapter.publicKey!.toString(),
        refundAddress: wallet.adapter.publicKey!.toString(), // Same as sender for simplicity
        programId: "YourAxelarGasServiceProgramId",
        configPda: "YourConfigPDAAddress",
        wallet: { sendTransaction },
        connection
      };

      const signature = await addGasToSolana(params);
      setResult(signature);
    } catch (error) {
      console.error('Error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Add Gas to Solana Transaction</h2>
      <button onClick={handleAddGas} disabled={isLoading || !wallet}>
        {isLoading ? 'Adding Gas...' : 'Add Gas'}
      </button>
      {result && (
        <div>
          <h3>Result:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default SolanaAddGasComponent;
```

## Key Features

### **1. Single Object Parameter** ✅
- Uses destructured object parameter instead of positional parameters
- More maintainable and less error-prone
- Follows modern JavaScript/TypeScript best practices

### **2. Direct Transaction Return** ✅  
- SDK returns ready-to-use `Transaction` object from `@solana/web3.js`
- No manual instruction creation required
- Just call `wallet.sendTransaction(transaction, connection)`

### **3. MessageId Format** ✅
- Uses `messageId` with format `"txHash-logIndex"`
- Consistent with other Axelar chain implementations
- SDK automatically parses and validates the components

### **4. Comprehensive Validation** ✅
- Validates messageId format (`"txHash-logIndex"`)
- Validates base58 transaction hash decoding (64 bytes)
- Validates logIndex as non-negative integer
- Validates all Solana addresses using PublicKey constructor
- Descriptive error messages for debugging

### **5. TypeScript Support** ✅
- Full type definitions included
- Proper error handling with typed exceptions
- IDE autocompletion and validation

## Error Handling

The SDK provides detailed error messages for common issues:

```typescript
// Invalid messageId format
"Invalid messageId format: expected \"txHash-logIndex\", got \"invalid-format\""

// Invalid transaction signature
"Failed to decode Solana transaction signature: invalidSignature. Invalid character 'l' at position 1"

// Invalid address
"Invalid sender address: invalidAddress. Invalid public key input"

// Invalid log index
"Invalid logIndex in messageId: must be a non-negative integer, got abc"
```

This makes debugging much easier during development and integration.