'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLReceiveChallengeMessage = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 14;
class SLReceiveChallengeMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(buf) {
        super();
        this.messageId = _MSG_ID;
        this.createFromBuffer(buf);
        this.decode();
    }
    challengeString;
    decode() {
        super.decode();
        this.challengeString = this.readSLString();
    }
    get() {
        return this.challengeString;
    }
}
exports.SLReceiveChallengeMessage = SLReceiveChallengeMessage;
;
//# sourceMappingURL=SLChallengeMessage.js.map