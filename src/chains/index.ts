import Bitcoin  from "./Bitcoin";
import Cosmos   from "./Cosmos";
import Ethereum from "./Ethereum";
import {IChain} from "../interface";

export * from "./Bitcoin";
export * from "./Cosmos";
export * from "./Ethereum";
export * from "./ChainList";

export const ChainList: IChain[] = [
	new Bitcoin(),
	new Cosmos(),
	new Ethereum()
];