'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLReceiveGatewayDataMessage = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 18003;
class SLReceiveGatewayDataMessage extends SLMessage_1.Inbound {
    constructor(buf) {
        super(0, 0);
        this.readFromBuffer(buf);
        this.decode();
    }
    decode() {
        super.decode();
        let gatewayFound = this._smartBuffer.readUInt8() !== 0;
        let licenseOK = this._smartBuffer.readUInt8() !== 0;
        let ipAddr = this.readSLString();
        let port = this._smartBuffer.readUInt16LE();
        let portOpen = this._smartBuffer.readUInt8() !== 0;
        let relayOn = this._smartBuffer.readUInt8() !== 0;
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
;
//# sourceMappingURL=SLGatewayDataMessage.js.map