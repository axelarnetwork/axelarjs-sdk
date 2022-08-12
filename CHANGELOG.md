# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.7.0] - 2022-AUGUST-12

changelog vs. 0.6.x. changelogs prior to 0.7.0 were not systematically captured, but they will be going forward.

### Changed

- refactor to how chains and assets are instantiated. now fetches this list dynamically from a remote resource instead.
  - in earlier versions, the list of chains and assets was hard-coded to the SDK version, meaning that any changes to chains or assets required a version bump in the SDK.
- remove unused dependencies from package.json
- new axelarjs-types (based on axelar-core v20 upgrade)

### Fixed

- resolves https://github.com/axelarnetwork/axelarjs-sdk/issues/127
- resolves https://github.com/axelarnetwork/axelarjs-sdk/issues/116
