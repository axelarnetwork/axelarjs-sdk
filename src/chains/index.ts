import Axelar from "./Axelar";
import Bitcoin  from "./Bitcoin";
import Cosmos   from "./Cosmos";
import Ethereum from "./Ethereum";
import {IChain} from "../interface";

export * from "./Axelar";
export * from "./Bitcoin";
export * from "./Cosmos";
export * from "./Ethereum";

export const ChainList: IChain[] = [
	new Axelar(),
	// new Bitcoin(),
	new Cosmos(),
	new Ethereum()
];