import BlockCypherService from "./BlockCypherService";
import EthersJsService    from "./EthersJsService";

const waitingService: any = {
	"btc": BlockCypherService,
	"eth": EthersJsService
};

const getWaitingService = (type: string) => {
	return new waitingService[type.toLowerCase()];
};

export default getWaitingService;