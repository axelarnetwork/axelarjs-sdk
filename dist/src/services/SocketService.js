"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_client_1 = require("socket.io-client");
const chains_1 = require("../chains");
class SocketService {
    constructor(resourceUrl, environment, testMode = false) {
        this.testMode = false;
        this.resourceUrl = resourceUrl;
        this.environment = environment;
        this.testMode = testMode;
    }
    createSocket() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.testMode) {
                this.socket = (0, socket_io_client_1.io)(this.resourceUrl, {
                    reconnectionDelay: 0,
                    forceNew: true,
                    transports: ["websocket"],
                    extraHeaders: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
                    },
                });
            }
            else {
                this.socket = (0, socket_io_client_1.io)(this.resourceUrl, {
                    transports: ["websocket"],
                    reconnectionDelayMax: 10000,
                    extraHeaders: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
                    },
                });
                this.supportedChains = yield (0, chains_1.loadChains)({ environment: this.environment });
            }
            return new Promise((resolve) => {
                this.socket.on("connect", () => {
                    resolve(true);
                });
            });
        });
    }
    joinRoomAndWaitForEvent(roomId, sourceChain, destinationChain, destinationAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createSocket();
            return new Promise((resolve) => {
                const ms = 1.8e6; //30 minutes
                const timeout = setTimeout(() => {
                    this.socket.off("bridge-event");
                    this.disconnect();
                }, ms);
                this.socket.emit("room:join", roomId);
                this.socket.on("bridge-event", (data) => {
                    const attributes = data.Attributes;
                    const sourceChainConfig = this.supportedChains.find((chain) => chain.chainIdentifier[this.environment].toLowerCase() === sourceChain.toLowerCase());
                    const destChainConfig = this.supportedChains.find((chain) => chain.chainIdentifier[this.environment].toLowerCase() === destinationChain.toLowerCase());
                    const sourceChainIsAxelarnet = (sourceChainConfig === null || sourceChainConfig === void 0 ? void 0 : sourceChainConfig.module) === "axelarnet";
                    const destChainIsAxelar = destinationChain.toLowerCase() === "axelar";
                    const sourceChainMatch = sourceChainIsAxelarnet ||
                        attributes.sourceChain.toLowerCase() === sourceChain.toLowerCase();
                    const destChainMatch = attributes.destinationChain.toLowerCase() ===
                        (destChainIsAxelar ? "axelarnet" : destChainConfig.chainIdentifier[this.environment]);
                    const destAddressMatch = attributes.destinationAddress === destinationAddress;
                    if (sourceChainMatch && destChainMatch && destAddressMatch) {
                        clearTimeout(timeout);
                        this.socket.off("bridge-event");
                        this.disconnect();
                        resolve(data);
                    }
                });
            });
        });
    }
    disconnect() {
        this.socket.disconnect();
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=SocketService.js.map