'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendChemDataMessage = exports.SLReceiveChemDataMessage = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 12592;
const _ASYNC_MSG_ID = 12505;
class SLReceiveChemDataMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(buf) {
        super();
        this.createFromBuffer(buf);
        this.decode();
    }
    data;
    decode() {
        console.log(`DECODE`);
        super.decode();
        let isValid = false;
        let sentinel = this.readInt32LE();
        if (sentinel === 42) {
            isValid = true;
            // this._smartBuffer.readOffset++;
            this.incrementReadOffset(1);
            let pH = this.readUInt16BE() / 100;
            let orp = this.readUInt16BE();
            let pHSetPoint = this.readUInt16BE() / 100;
            let orpSetPoint = this.readUInt16BE();
            // this._smartBuffer.readOffset += 12;
            this.incrementReadOffset(12);
            let pHTankLevel = this.readUInt8();
            let orpTankLevel = this.readUInt8();
            let saturation = this.readUInt8();
            if ((saturation & 128) !== 0) {
                saturation = -(256 - saturation);
            }
            saturation /= 100;
            let calcium = this.readUInt16BE();
            let cyanuricAcid = this.readUInt16BE();
            let alkalinity = this.readUInt16BE();
            let salt = this.readUInt16LE();
            let saltPPM = salt * 50;
            let temperature = this.readUInt8();
            this.incrementReadOffset(2);
            let balance = this.readUInt8();
            let corrosive = (balance & 1) !== 0;
            let scaling = (balance & 2) !== 0;
            let error = (salt & 128) !== 0;
            this.data = {
                isValid,
                pH,
                orp,
                pHSetPoint,
                orpSetPoint,
                pHTankLevel,
                orpTankLevel,
                saturation,
                calcium,
                cyanuricAcid,
                alkalinity,
                saltPPM,
                temperature,
                balance,
                corrosive,
                scaling,
                error
            };
        }
    }
    static getAsyncResponseId() {
        return _ASYNC_MSG_ID;
    }
    get() {
        return this.data;
    }
}
exports.SLReceiveChemDataMessage = SLReceiveChemDataMessage;
;
class SLSendChemDataMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(senderId) {
        super();
        this.createBaseMessage();
        if (senderId)
            this.senderId = senderId;
        // this.addHeader(this.senderId, _MSG_ID)
        this._smartBuffer.writeInt32LE(0); // controller index
    }
    static getAsyncResponseId() {
        return _ASYNC_MSG_ID;
    }
}
exports.SLSendChemDataMessage = SLSendChemDataMessage;
;
//# sourceMappingURL=SLChemDataMessage.js.map