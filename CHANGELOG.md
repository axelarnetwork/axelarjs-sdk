# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.13.10] - 2024-JANUARY-12

- Remove unused internal APIs
- Add Fraxtal testnet

## [0.13.8] - 2023-DECEMBER-18

- Add `Immutable` to mainnet configs; update `Immutable` testnet RPC

## [0.13.7] - 2023-DECEMBER-4

- Fix BigNumberUnits utility to adjust for another `fractional component exceeds decimals` edge case
- Add AddGasToCosmosChain method to AxelarGMPRecoveryAPI
- Remove singleton pattern that was used in the `getConfigs` function that caused an issue in toggling environments in the AxelarQueryAPI
- Refactor "EvmChain" enum
- Update `manualRelayToDestChain` method, adding an additional parameter for `txEventIndex` that is used to confirm events on the network
- Update `manualRelayToDestChain` method, adding an additional (optional) parameter for `messageId` that is used to recover transactions for GMP transactions from Cosmos source chains
- Add `Scroll` to testnet/mainnet configs, `Celestia`, `Centrifuge` to testnet/mainnet, `Haqq` to mainnet, `Provenance`, `Sepolia`, `Arbitrum-Sepolia`, `Immutable` to testnet, `Teritori` to mainnet
- Updated Osmosis testnet to `osmosis-7` that points to `osmo-test-5`

## [0.13.6] - 2023-SEPTEMBER-1

- Fix the issue with `manualRelayToDestChain` where the web client incorrectly utilizes the provider from the injected browser wallet instead of the rpcUrl embedded in the SDK. This error arises when the injected wallet's network differs from the source chain.
- update `manualRelayToDestChain` method to accept `txLogIndex` optional parameter
- update `addGas`, `addNativeGas`
- Add `Linea`, `Base`, `Mantle` evm mainnet configs; `Archway`, `Aura`, `IXO`, `Neutron`, `Provenance`, `Sei` to cosmos mainnet configs; Polygon-zkEvm to evm configs
- Update the `estimateGasFee` method on `AxelarQueryAPI` to accept `BigNumberish` type for `gasLimit` parameter
- fix `doesTxMeetConfirmHt` and `getEventIndex` methods to search for EVM transaction receipt from Axelarscan API if not found from the source blockchain
- fix `BigNumberUtils` to address `fractional component exceeds decimals` error, a valid edge case where floating point numbers can exceed specified atomic units

## [0.13.5] - 2023-JULY-10

- Fix constant declaration for Optimism testnet

## [0.13.3] - 2023-JULY-7

- Fix build issue in `0.13.2` with post-install script

## [0.13.0] - 2023-JUNE-30

- AxelarAssetTransfer
  - add `sendToken` method that allows token transfers directly from a source chain (instead of using the deposit address method). This includes both Cosmos-based and EVM-based source chains.
- AxelarGMPRecoveryAPI
  - update `manualRelayToDestChain` method to include cosmos <> evm directions
- Updated chain list constants to include recently-added chains (Linea testnet, Optimism testnet/mainnet), various Cosmos chains
- Technical upgrades
  - added a post-install script to alert sdk consumers on new versions (if any) post 0.13.0
  - upgraded downstream dependencies

## [0.12.8] - 2023-MAY-28

- technical change, upgraded dependencies

## [0.12.7] - 2023-MAY-12

- AxelarRecoveryAPI
  - Fix `queryTransactionStatus` method to accept cosmos-based source chains
  - Add `expressExecuted` API response into the response object for the `queryTransactionStatus` method
- AxelarQueryAPI
  - Fix `estimateGasFee` method to allow for cosmos source chains, including adjustments to the way in which the numbers are calculated after swapping between currencies with different decimals
  - Fix: throw error instead of returning 0 in estimateGasFee
  - Update `GMPParams` in `estimateGasFee` method to accept `amountInUnits`
- AxelarGMPRecoveryAPI
  - update the delay after transaction confirmation to 60 seconds before it finds the confirmed event on the axelar network (from 30 seconds originally)
- Add `Filecoin` EVM configs
- Updated Osmosis testnet to `osmosis-6` that points to `osmo-test-5`
- add all current active chains (as of May 12 2023) to the `supported-chains-list` file
- fix issue in generated deposit addresses for `wrap` transactions, addresses https://github.com/axelarnetwork/axelarjs-sdk/issues/267

## [0.12.6] - 2023-MARCH-30

- AxelarQueryAPI
  - Update `estimateGasFee` function to allow user to see a more detailed response by passing in an additional parameter `gmpParams`, where they can also specify the details of the specific GMP call

## [0.12.5] - 2023-MARCH-17

- AxelarQueryAPI
  - Fixed `estimateGasFee` function in how it handles the `minGasPrice` parameter, which should compare the min to the destination chain gas price, whereas it was comparing to the source chain price originally.
  - Updated `estimateGasFee` to accept `isGMPExpressTransaction` parameter
- AxelarRecoveryAPI
  - introduced wss subscription service (subscribeToTx) to invoke subscribe to specific transactions for updates
  - fixed `addNativeGas` method so that it does not subtract out the fee the user originally paid (which has led to situations of adding zero gas)
- AxelarAssetTransfer
  - adding feature to generate deposit addresses "offline" for erc-20 transfers
- AxelarGMPRecoveryAPI
  - fixes to manualRelayToDestinationChain to first check if transaction is already confirmed but not broadcasted, and broadcast the transaction (as identified by command ID) if so
- update constants to include `BNBCHAIN` (in addition to `BINANCE`)

## [0.12.4] - 2023-FEBRUARY-1

- AxelarQueryAPI
  - added `minGasPrice` parameter for the `estimateGasFee` function. `minGasPrice` is a floor set for the gas price in wei, used as override in case estimated gas price is below specified minimum.
- AxelarGMPRecoveryAPI
  - added `gasLimitBuffer` to `EvmWalletDetails` object. The `execute` function will now incorporate the use of `gasLimitBuffer`, providing an increased gas limit to the originally estimated gas value. As an example, if the estimated gas is `300k`, with a gasLimitBuffer of `100k`, the final gas limit will be `400k`.

## [0.12.3] - 2023-JANUARY-30

- AxelarAssetTransfer
  - (bugfix): normalize casing for chain ID and gas taken IDs

## [0.12.1] - 2023-JANUARY-18

- AxelarQueryAPI
  - fixed `getDenomFromSymbol` method that now erroneously returns native assets denom for erc20 input. bug was introduced when native assets were added to s3 asset configs

## [0.12.0] - 2023-JANUARY-17

- changed all method signatures to require chain IDs (as recognized by Axelar) instead of chain name. For example, in testnet, Ethereums (Goerli) is recognized as `ethereum-2`
  - added a chainId suggestion when passing wrong chainId e.g. chain name in `getTransferFee` api.
- AxelarQueryAPI
  - added a query to retrieve all active chains on the network (`getActiveChain`) and updates all method implementations to ensure that invocations are only made to live chains
  - added `timeSpent` field to the `queryTransactionStatus` API.
  - added more possible values for `GMPStatus` enum.
  - added `getTransferLimit` query to retrieve the maximum transfer for an asset on a chain
- `getDepositAddress` updates:
  1. update payload signature to accept a destructured object parameter. the method is still backwards compatible for previous invocations using regular parameters
  2. merged `getDepositAddressForNativeUnwrap` and `getDepositAddressForNativeWrap` method functionality into `getDepositAddress` method
- upgrade axelarjs-types dependency to `v0.27.0`
- update default axelar rpc & lcd endpoints in testnet/mainnet from quickapi to imperator
- fix [native gas estimates](https://github.com/axelarnetwork/axelarjs-sdk/pull/193)

## [0.11.7] - 2022-OCTOBER-26

- updated supported chains list
- updated `getDepositAddressForNativeUnwrap` to expose intermediary deposit address
- removed salt argument from `getDepositAddressForNativeUnwrap` and `getDepositAddressForNativeWrap`
- use bytes32 `0x0` salt

## [0.11.6] - 2022-OCTOBER-17

- update `getDepositAddress` in `AxelarAssetTransfer` to use chain identifiers
- update `getDepositAddress` in `AxelarAssetTransfer` to verify source & destination chain and provide suggestion
- added chain identifiers list as object literal
- fixed destination address check bug
- added wrap/unwrap functionality

## [0.11.5] - 2022-OCTOBER-12

- [queryTransactionStatus] Changed error object type from `any` to `GMPError`
- [queryTransactionStatus] Fixed error object is undefined when "insufficient fee"
- [queryTransactionStatus] Added `approved` object for approval tx details

## [0.11.4] - 2022-SEPTEMBER-22

- update `queryTransactionStatus` in `AxelarRecoveryApi` to include new `executing` status.
- update GET requests in `AxelarRecoveryApi` to disable cache.
- fixed a regression issue caused in 0.11.0 in `AxelarAssetTransfer`, where the `getDepositAddress` method is no longer able to generate deposit addresses for cosmos-based destination chains, e.g. Axelar, Osmosis. Please update to this version if you are using this method.
- [technical fix]: improving error messaging of REST responses.

## [0.11.3] - 2022-SEPTEMBER-21

- fixed a regression issue caused in 0.11.0 in `AxelarAssetTransfer`, where the `getDepositAddress` method is no longer able to generate deposit addresses for cosmos-based source chains, e.g. Axelar, Osmosis. Please update to this version if you are using this method.
- added an additional default parameter in `estimateGasFee` on `AxelarQueryAPI` to include a buffer to pad the calculated gas fee. this accounts for slippage that may occur throughout a tx's execution

## [0.11.1] - 2022-SEPTEMBER-14

- update to `queryTransactionStatus` method on `AxelarRecoveryApi` to return additional optional fields for `executed` and `callback` objects from the Axelarscan API response

## [0.11.0] - 2022-SEPTEMBER-12

- add `AxelarTransferAPI` to allow query transfer status for cross-chain transfer via deposit address or sendToken method. #154, addresses #143
- rename `axelarCachingServiceUrl` to `axelarGMPApiUrl`
- Fixed an issue where the deposit address can be the same in the case of two parallel requests with different source chain names. #157
  - UPDATE: this version caused a regression issue for deposit address generation for cosmos-based based source chains, e.g. Axelar, Osmosis, etc. Please update to 0.11.2
- updates `estimateGasFee` method to allow for input gastoken

## [0.10.3] - 2022-SEPTEMBER-5

- update the `AxelarGMPRecoveryAPI` to allow for rpc/lcd endpoint overrides in constructor for the API

## [0.10.2] - 2022-SEPTEMBER-5

- fixing a typo `estimateGasFee` method parameter for `GasToken` symbol. It should be `BNB` for Binance, previously `BSC`.

## [0.10.1] - 2022-SEPTEMBER-5

### Internal

- reduce testing time for `AxelarGMPRecoveryAPI.spec.ts` from about 3-4 mins to ~30s

## [0.10.0] - 2022-SEPTEMBER-1

- update AxelarGMPRecoveryAPI's `addGas` and `addNativeGas` methods to fetch gas receiver contract addresses remotely, replacing hard-coded values

## [0.9.2] - 2022-AUGUST-31

- fix `execute` in AxelarGMPRecoveryAPI that returns wrong transaction status in some case.
- accept `txLogIndex` (optional) to `execute` function to execute the right contract call which is needed when there're multiple `ContractCallWithToken` or `ContractCall` events emitted by Axelar Gateway contract associated with given transaction hash.

## [0.9.1] - 2022-AUGUST-30

### Changed

- add `getNativeGasBaseFee` to AxelarQueryAPI. This method gets the base fee in native token wei for a given source and destination chain combination. update `estimateGasFee` to add result of `getNativeGasBaseFee` if native token is selected
- fix `estimateGasFee` to handle decimal conversions, in cases where ERC20 token is selected as source token

## [0.9.0] - 2022-AUGUST-29

### Changed

- update `@axelar-network/axelarjs-types` dependency to v0.24.0.
- add mainnet RPC endpoints for transaction recovery API, which can now toggle endpoints per environment

## [0.8.1] - 2022-AUGUST-22

### Changed

- add `getAssetConfigFromDenom`: https://github.com/axelarnetwork/axelarjs-sdk/pull/124
- fix `getTransferFee` and `getFeeForChainAndAsset` in `AxelarQueryAPI` to accept RPC endpoint override: https://github.com/axelarnetwork/axelarjs-sdk/issues/141

## [0.8.0] - 2022-AUGUST-12

### Changed

- update `@axelar-network/axelarjs-types` dependency to v0.22.1.

## [0.7.1] - 2022-AUGUST-12

changelog vs. 0.6.x. changelogs prior to 0.7.0 were not systematically captured, but they will be going forward.

### Changed

- refactor to how chains and assets are instantiated. now fetches this list dynamically from a remote resource instead.
  - in earlier versions, the list of chains and assets was hard-coded to the SDK version, meaning that any changes to chains or assets required a version bump in the SDK.
  - any method that uses `loadChains` or `loadAssets` changes to an asynchronous function that resolves to the expected response type, e.g. `public getDenomFromSymbol(symbol: string, chainName: string): string` becomes `public getDenomFromSymbol(symbol: string, chainName: string): Promise<string>`.
  - Impacted methods:
    - `AxelarQueryAPI`
      - `getDenomFromSymbol`
      - `getSymbolFromDenom`
    - `AxelarRecoveryAPI`
      - `getChainInfo`
    - `validateDestinationAddressByChainSymbol` and `validateDestinationAddressByChainName`
- refactor to LCD queries in `AxelarQueryAPI` to use `axelarjs-types` natively, rather than query params.
- interfaces that were previously hard-coded in the SDK (such as `FeeInfoResponse` and `TransferFeeResponse`) are now imported from `axelarjs-types`
- remove unused dependencies from package.json
- new axelarjs-types (based on axelar-core v20 upgrade): https://www.npmjs.com/package/@axelar-network/axelarjs-types/v/0.20.0

### Fixed

- Rest fetch error. resolves https://github.com/axelarnetwork/axelarjs-sdk/issues/127
- Optimized build size. resolves https://github.com/axelarnetwork/axelarjs-sdk/issues/116
