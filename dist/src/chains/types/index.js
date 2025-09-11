"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketListenerTypes = exports.LinkType = void 0;
var LinkType;
(function (LinkType) {
    LinkType["EVM"] = "/axelar.evm.v1beta1.LinkRequest";
    LinkType["COS"] = "/axelar.axelarnet.v1beta1.LinkRequest";
})(LinkType || (exports.LinkType = LinkType = {}));
// for connections from ui >> bridge server
var SocketListenerTypes;
(function (SocketListenerTypes) {
    /*axelarnet listener for deposit event*/
    SocketListenerTypes["LINK"] = "LINK";
    SocketListenerTypes["WAIT_FOR_DEPOSIT"] = "WAIT_FOR_DEPOSIT";
    SocketListenerTypes["DEPOSIT_CONFIRMED"] = "DEPOSIT_CONFIRMED";
})(SocketListenerTypes || (exports.SocketListenerTypes = SocketListenerTypes = {}));
//# sourceMappingURL=index.js.map