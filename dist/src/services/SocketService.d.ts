import { Environment } from "../libs";
export declare class SocketService {
    private socket;
    private resourceUrl;
    private testMode;
    private supportedChains;
    private environment;
    constructor(resourceUrl: string, environment: Environment, testMode?: boolean);
    createSocket(): Promise<unknown>;
    joinRoomAndWaitForEvent(roomId: string, sourceChain: string, destinationChain: string, destinationAddress: string): Promise<any>;
    disconnect(): void;
}
//# sourceMappingURL=SocketService.d.ts.map