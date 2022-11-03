'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendIntellichlorConfigMessage = exports.SLReceiveIntellichlorConfigMessage = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 12572;
class SLReceiveIntellichlorConfigMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    installed;
    status;
    level1;
    level2;
    salt;
    flags;
    superChlorTimer;
    constructor(buf, senderId) {
        super();
        this.createFromBuffer(buf);
        this.decode();
        // if (buf) {
        // var size = buf.readInt32LE(4) + 8;
        // super(buf, MSG_ID, size);
        // } else {
        //   super(senderId, MSG_ID);
        //   this.writeInt32LE(0); // controller index
        // }
    }
    decode() {
        super.decode();
        this.installed = this._smartBuffer.readInt32LE() === 1;
        this.status = this._smartBuffer.readInt32LE();
        this.level1 = this._smartBuffer.readInt32LE();
        this.level2 = this._smartBuffer.readInt32LE();
        this.salt = this._smartBuffer.readInt32LE() * 50;
        this.flags = this._smartBuffer.readInt32LE();
        this.superChlorTimer = this._smartBuffer.readInt32LE();
    }
}
exports.SLReceiveIntellichlorConfigMessage = SLReceiveIntellichlorConfigMessage;
;
class SLSendIntellichlorConfigMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    installed;
    status;
    level1;
    level2;
    salt;
    flags;
    superChlorTimer;
    constructor(buf, senderId) {
        super();
        // if (buf) {
        //   var size = buf.readInt32LE(4) + 8;
        //   super(buf, MSG_ID, size);
        // } else {
        // super(senderId, MSG_ID);
        this.createEmpty();
        this.addHeader(senderId, _MSG_ID);
        this._smartBuffer.writeInt32LE(0); // controller index
        // }
    }
}
exports.SLSendIntellichlorConfigMessage = SLSendIntellichlorConfigMessage;
;
//# sourceMappingURL=SLSaltCellConfigMessage.js.map