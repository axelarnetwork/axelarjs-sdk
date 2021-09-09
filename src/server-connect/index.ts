import {ClientConnect} from "./ClientConnect";
import {IAssetTransferObject} from "../interface/IAssetTransferObject";
import {TransferAssetTypes} from "../interface";

export class AxelarBridgeFacade {

    private clientConnection: ClientConnect;

    constructor(resourceUrl: string) {
        console.log("AxelarBridgeFacade establishing a new connection");
        this.clientConnection = new ClientConnect(resourceUrl);
    }

    public transferAssets(topic: TransferAssetTypes, message: IAssetTransferObject): void {
        this.clientConnection.emitMessage(topic, { message });
    }

    public closeConnection() {
        this.clientConnection.disconnect();
    }

}
