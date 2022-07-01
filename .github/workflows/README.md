# Workflows

## Lint

Run linter using https://github.com/wearerequired/lint-action

**Trigger events**: `push to a pull request branch`

**Effect**: Reports lint result in the pull request

## Test

Run tests

**Trigger events**: `push to a pull request branch`

**Effect**: Reports test result in the pull request

## Release

Bump version and publish to npm.

**Trigger events**: `push to main`, `merge a pull request to main`

**Effect**: Bump the version based on the commit message -> commit and push updated version in `package.json` -> add tag -> publish to npm

| Keyword       | Action                                                                            | Example version changes                                |
| ------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| time to party | Increases **major** version -> commit & push -> tag new version -> publish to npm | 0.6.6 -> 1.0.0                                         |
| feat, minor   | Increases **minor** version -> commit & push -> tag new version -> publish to npm | 0.6.6 -> 0.7.0                                         |
| pre-alpha     | Increases **alpha** version -> commit & push -> tag new version -> publish to npm | 0.6.6 -> 0.6.7-alpha.0, 0.6.7-alpha.0 -> 0.6.7-alpha.1 |
| \*            | Increases **patch** version -> commit & push -> tag new version -> publish to npm | 0.6.6 -> 0.6.7, 0.6.7-alpha.3 -> 0.6.8                 |

Note that we may not want to increase major version soon, so the keyword to do that is kind of funny.

## Release Alpha (Haven't tested yet)

Bump alpha version in specified branch and publish it to npm

**Trigger events**: Manually trigger in [Actions](https://github.com/axelarnetwork/axelarjs-sdk/actions).

**Effect**: Bump the alpha version -> commit and push updated version in `package.json` -> publish to npm
