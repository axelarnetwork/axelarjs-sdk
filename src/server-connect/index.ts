import {ClientConnect} from "./ClientConnect";
import {IAssetTransferObject} from "../interface/IAssetTransferObject";
import {TRANSFER_RESULT, TransferAssetTypes} from "../interface";

export class AxelarBridgeFacade {

    private clientConnection: ClientConnect;

    constructor(resourceUrl: string) {
        console.log("AxelarBridgeFacade establishing a new connection");
        this.clientConnection = new ClientConnect(resourceUrl);
    }

    public async transferAssets(topic: TransferAssetTypes, message: IAssetTransferObject): Promise<string> {
        this.clientConnection.emitMessage(topic, { message });
        return await this.clientConnection.awaitResponse(TRANSFER_RESULT);
    }

    public closeConnection() {
        this.clientConnection.disconnect();
    }

}
