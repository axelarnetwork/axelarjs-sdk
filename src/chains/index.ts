import {IChain}  from "../interface";
import Axelar    from "./Axelar";
import Cosmos    from "./Cosmos";
import Ethereum  from "./Ethereum";
import Avalanche from "./Avalanche";
import Terra     from "./Terra";

export * from "./Axelar";
export * from "./Bitcoin";
export * from "./Cosmos";
export * from "./Ethereum";

export const ChainList: IChain[] = [
	new Axelar(),
	new Avalanche(),
	new Cosmos(),
	new Ethereum(),
	new Terra()
];