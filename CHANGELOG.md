# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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
