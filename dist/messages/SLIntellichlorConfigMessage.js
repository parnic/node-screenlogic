'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendIntellichlorConfigMessage = exports.SLReceiveIntellichlorConfigMessage = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 12572;
class SLReceiveIntellichlorConfigMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    data;
    superChlorTimer;
    constructor(buf, senderId) {
        super();
        this.createFromBuffer(buf);
        this.decode();
    }
    decode() {
        super.decode();
        this.data = {
            installed: this.readInt32LE() === 1,
            status: this.readInt32LE(),
            poolSetPoint: this.readInt32LE(),
            spaSetPoint: this.readInt32LE(),
            salt: this.readInt32LE() * 50,
            flags: this.readInt32LE(),
            superChlorTimer: this.readInt32LE()
        };
    }
    // static getResponseId() {
    //   return MSG_ID + 1;
    // }
    get() {
        return this.data;
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
    constructor(senderId) {
        super();
        this.createBaseMessage();
        // this.addHeader(senderId, _MSG_ID);
        this.writeInt32LE(0); // controller index
    }
}
exports.SLSendIntellichlorConfigMessage = SLSendIntellichlorConfigMessage;
;
//# sourceMappingURL=SLIntellichlorConfigMessage.js.map