export default {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
  },
  solidity: {
    version: "0.8.9",
  },
  paths: {
    root: "./src/libs/test",
    sources: "./contracts",
    tests: ".",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};
