"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayTx = void 0;
class GatewayTx {
    constructor(unsignedTx, provider) {
        this.txRequest = {
            to: unsignedTx.to,
            data: unsignedTx.data,
            value: unsignedTx.value,
        };
        this.provider = provider;
    }
    send(signer, txOption) {
        const txRequest = Object.assign(Object.assign({}, this.txRequest), txOption);
        return signer.connect(this.provider).sendTransaction(txRequest);
    }
    estimateGas() {
        return this.provider.estimateGas(this.txRequest);
    }
}
exports.GatewayTx = GatewayTx;
//# sourceMappingURL=GatewayTx.js.map