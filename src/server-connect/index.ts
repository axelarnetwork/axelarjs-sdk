import {ClientSocketConnect} from "./ClientSocketConnect";
import {IAssetTransferObject} from "../interface/IAssetTransferObject";
import {CLIENT_API_POST_TRANSFER_ASSET, TRANSFER_RESULT, TransferAssetTypes} from "../interface";
import {ClientRest} from "./ClientRest";

export class TransferAssetBridge {

    private clientSocketConnect: ClientSocketConnect;
    private clientRest: ClientRest;

    constructor(resourceUrl: string) {
        console.log("TransferAssetBridge establishing a new connection");
        this.clientSocketConnect = new ClientSocketConnect(resourceUrl);
        this.clientRest = new ClientRest(resourceUrl);
    }

    public async transferAssets(message: IAssetTransferObject): Promise<string> {

        return this.getDepositAddress(message);
    }

    public async getDepositAddress(message: IAssetTransferObject): Promise<string> {
        this.listenForTransactionStatus(TransferAssetTypes.BTC_TO_EVM, message);
        return await this.clientRest.post(CLIENT_API_POST_TRANSFER_ASSET, message);
    }

    public listenForTransactionStatus(topic: TransferAssetTypes, message: IAssetTransferObject): void {
        this.clientSocketConnect.emitMessage(topic, { message });
        this.clientSocketConnect.awaitResponse(TRANSFER_RESULT);
    }

    public closeConnection() {
        this.clientSocketConnect.disconnect();
    }

}
