'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLPingServerMessage = exports.SLReceivePingServerMessage = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 16;
class SLReceivePingServerMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    clientId;
    constructor(buf) {
        super();
        this.createFromBuffer(buf);
        this.decode();
    }
}
exports.SLReceivePingServerMessage = SLReceivePingServerMessage;
;
class SLPingServerMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(clientId, senderId = 0) {
        super();
        this.createBaseMessage();
        // this.addHeader(senderId, _MSG_ID);
        this.encode();
    }
}
exports.SLPingServerMessage = SLPingServerMessage;
;
//# sourceMappingURL=SLPingServerMessage.js.map