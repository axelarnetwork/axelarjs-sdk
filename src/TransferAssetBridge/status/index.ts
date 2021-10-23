import BlockCypherService            from "./BlockCypherService";
import EthersJsService               from "./EthersJsService";
import TendermintService             from "./TendermintService";
import {IAsset, ISupportedChainType} from "../../constants";

const waitingService: { [chainSymbol: string]: any } = {
	"btc": BlockCypherService,
	"eth": EthersJsService,
	"cos": TendermintService
};

const getWaitingService = (type: string, chainInfo: ISupportedChainType, tokenInfo: IAsset) => {
	return new waitingService[type.toLowerCase()](chainInfo, tokenInfo);
};

export default getWaitingService;