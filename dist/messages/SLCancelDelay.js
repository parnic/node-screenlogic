'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLCancelDelay = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 12580;
class SLCancelDelay extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(senderId) {
        super();
        this.messageId = _MSG_ID;
        this.createBaseMessage();
        //     this.addHeader(senderId, this.messageId);
    }
    encode() {
        this.writeInt32LE(0);
        super.encode();
    }
}
exports.SLCancelDelay = SLCancelDelay;
;
//# sourceMappingURL=SLCancelDelay.js.map