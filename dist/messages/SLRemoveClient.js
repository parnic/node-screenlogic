'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendRemoveClient = exports.SLReceiveRemoveClient = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 12524;
class SLReceiveRemoveClient extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    clientId;
    constructor(buf) {
        super();
        this.createFromBuffer(buf);
        this.decode();
    }
}
exports.SLReceiveRemoveClient = SLReceiveRemoveClient;
;
class SLSendRemoveClient extends SLMessage_1.SLMessage {
    clientId;
    static MSG_ID = _MSG_ID;
    constructor(clientId, senderId) {
        super();
        this.createBaseMessage();
        // this.addHeader(senderId, _MSG_ID);
        this.clientId = clientId;
        this.encode();
    }
    encode() {
        this.writeInt32LE(0);
        this.writeInt32LE(this.clientId);
        super.encode();
    }
}
exports.SLSendRemoveClient = SLSendRemoveClient;
;
//# sourceMappingURL=SLRemoveClient.js.map