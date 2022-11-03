'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendAddClient = exports.SLReceiveAddClient = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 12522;
class SLReceiveAddClient extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    clientId;
    constructor(buf) {
        super();
        this.createFromBuffer(buf);
        // anything to do here?
        this.decode();
    }
}
exports.SLReceiveAddClient = SLReceiveAddClient;
;
class SLSendAddClient extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    clientId;
    constructor(clientId, senderId = 0) {
        super();
        this.createBaseMessage();
        // // this.addHeader(senderId, _MSG_ID);
        this.clientId = clientId;
        this.encode();
    }
    encode() {
        this.writeInt32LE(0);
        this.writeInt32LE(this.clientId);
        super.encode();
    }
}
exports.SLSendAddClient = SLSendAddClient;
;
//# sourceMappingURL=SLAddClient.js.map