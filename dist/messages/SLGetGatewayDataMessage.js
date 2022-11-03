'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLGetGatewayDataMessage = void 0;
const SLMessage_1 = require("./SLMessage");
const MSG_ID = 18003;
class SLGetGatewayDataMessage extends SLMessage_1.SLMessage {
    constructor(buf) {
        // super();
        var size;
        if (buf && typeof buf === 'object') {
            size = buf.readInt32LE(4) + 8;
        }
        super(0, MSG_ID, size);
        if (typeof buf === 'string') {
            this.writeSLString(buf);
            this.writeSLString(buf);
        }
        else if (buf) {
            this._wroteSize = true;
            this.writeBuffer(buf, 0);
            this.decode();
        }
    }
    licenseOK;
    ipAddr;
    port;
    portOpen;
    relayOn;
    gatewayFound;
    writeMessage(str) {
        super.writeMessage(this.senderId, MSG_ID);
        this.writeSLString(str);
        this.writeSLString(str);
    }
    decode() {
        super.decode();
        this.gatewayFound = this.readUInt8() !== 0;
        this.licenseOK = this.readUInt8() !== 0;
        this.ipAddr = this.readSLString();
        this.port = this.readUInt16LE();
        this.portOpen = this.readUInt8() !== 0;
        this.relayOn = this.readUInt8() !== 0;
    }
    get() {
        super.decode();
        let data = {
            gatewayFound: false,
            licenseOK: false,
            ipAddr: '',
            port: 0,
            portOpen: false,
            relayOn: false
        };
        data.gatewayFound = this.gatewayFound;
        data.licenseOK = this.licenseOK;
        data.ipAddr = this.ipAddr;
        data.port = this.port;
        data.portOpen = this.portOpen;
        data.relayOn = this.relayOn;
        return data;
    }
    static getResponseId() {
        return MSG_ID + 1;
    }
}
exports.SLGetGatewayDataMessage = SLGetGatewayDataMessage;
;
//# sourceMappingURL=SLGetGatewayDataMessage.js.map