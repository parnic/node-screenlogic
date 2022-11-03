'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendVersionMessage = exports.SLReceiveVersionMessage = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 8120;
class SLReceiveVersionMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    version = "";
    constructor(buf) {
        super();
        this.createFromBuffer(buf);
        this.decode();
    }
    decode() {
        super.decode();
        this.version = this.readSLString();
        console.log(`version = ${this.version}`);
    }
}
exports.SLReceiveVersionMessage = SLReceiveVersionMessage;
;
class SLSendVersionMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    version = "";
    constructor(senderId) {
        super();
        this.createBaseMessage();
        // this.addHeader(senderId, _MSG_ID);
    }
}
exports.SLSendVersionMessage = SLSendVersionMessage;
;
//# sourceMappingURL=SLVersionMessage.js.map