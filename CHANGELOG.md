# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.7.0] - 2022-AUGUST-12

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
