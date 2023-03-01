'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLReceiveGatewayDataMessage = void 0;
const SLMessage_1 = require("./SLMessage");
class SLReceiveGatewayDataMessage extends SLMessage_1.Inbound {
    constructor(buf) {
        super(0, 0);
        this.readFromBuffer(buf);
        this.decode();
    }
    decode() {
        super.decode();
        const gatewayFound = this._smartBuffer.readUInt8() !== 0;
        const licenseOK = this._smartBuffer.readUInt8() !== 0;
        const ipAddr = this.readSLString();
        const port = this._smartBuffer.readUInt16LE();
        const portOpen = this._smartBuffer.readUInt8() !== 0;
        const relayOn = this._smartBuffer.readUInt8() !== 0;
        this.data = {
            gatewayFound,
            licenseOK,
            ipAddr,
            port,
            portOpen,
            relayOn
        };
    }
    get() {
        return this.data;
    }
}
exports.SLReceiveGatewayDataMessage = SLReceiveGatewayDataMessage;
//# sourceMappingURL=SLGatewayDataMessage.js.map