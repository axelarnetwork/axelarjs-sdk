export declare class RestService {
    private host;
    constructor(host: string);
    post(url: string, body: any, traceId?: string): Promise<any>;
    get(url: string, traceId?: string): Promise<any>;
    execRest(endpoint: string, requestOptions: any): Promise<any>;
}
//# sourceMappingURL=RestService.d.ts.map