import { rpcMap as testnetRpcMap, networkInfo as testnetNetworkInfo } from "./testnet";
import { rpcMap as mainnetRpcMap, networkInfo as mainnetNetworkInfo } from "./mainnet";

type rpcInfo = Record<string, Record<string, any>>;
const rpc: rpcInfo = {
  devnet: {
    rpcMap: testnetRpcMap,
    networkInfo: testnetNetworkInfo,
  },
  testnet: {
    rpcMap: testnetRpcMap,
    networkInfo: testnetNetworkInfo,
  },
  mainnet: {
    rpcMap: mainnetRpcMap,
    networkInfo: mainnetNetworkInfo,
  },
};
export default rpc;
