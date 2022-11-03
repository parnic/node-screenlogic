'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendGetSystemTime = exports.SLReceiveGetSystemTime = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 8110;
class SLReceiveGetSystemTime extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(buf) {
        super();
        this.messageId = _MSG_ID;
        this.createFromBuffer(buf);
        this.decode();
    }
    data;
    decode() {
        super.decode();
        let date = this.readSLDateTime();
        let year = date.getFullYear();
        let month = date.getMonth() + 1; // + 1 is for backward compatibility, SLTime represents months as 1-based
        let dayOfWeek = date.getDay(); // should probably be tweaked to adjust what days are 0-6 as SLTime and Javascript start on different days of the week
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        let millisecond = date.getMilliseconds();
        var adjustForDST = this.readInt32LE() === 1;
        this.data = {
            date,
            year,
            month,
            dayOfWeek,
            day,
            hour,
            minute,
            second,
            millisecond,
            adjustForDST
        };
    }
    get() {
        return this.data;
    }
}
exports.SLReceiveGetSystemTime = SLReceiveGetSystemTime;
;
class SLSendGetSystemTime extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(senderId) {
        super();
        this.messageId = _MSG_ID;
        this.createBaseMessage();
        //     this.addHeader(senderId, this.messageId);
    }
}
exports.SLSendGetSystemTime = SLSendGetSystemTime;
;
//# sourceMappingURL=SLGetSystemTime.js.map