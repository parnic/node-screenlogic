'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendGetScheduleData = exports.SLReceiveGetScheduleData = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 12542;
class SLReceiveGetScheduleData extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    data = [];
    constructor(buf) {
        super();
        this.messageId = _MSG_ID;
        this.createFromBuffer(buf);
        this.decode();
    }
    decode() {
        super.decode();
        let eventCount = this.readUInt32LE();
        for (var i = 0; i < eventCount; i++) {
            let scheduleId = this.readUInt32LE() - 700;
            let circuitId = this.readUInt32LE() - 499;
            let startTime = this.decodeTime(this.readUInt32LE());
            let stopTime = this.decodeTime(this.readUInt32LE());
            let dayMask = this.readUInt32LE();
            let flags = this.readUInt32LE();
            let heatCmd = this.readUInt32LE();
            let heatSetPoint = this.readUInt32LE();
            let days = this.decodeDayMask(dayMask);
            let event = {
                scheduleId,
                circuitId,
                startTime,
                stopTime,
                dayMask,
                flags,
                heatCmd,
                heatSetPoint,
                days
            };
            this.data.push(event);
        }
    }
    get() {
        return this.data;
    }
}
exports.SLReceiveGetScheduleData = SLReceiveGetScheduleData;
;
class SLSendGetScheduleData extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(scheduleType, senderId) {
        super();
        this.messageId = _MSG_ID;
        this.createBaseMessage();
        //     this.addHeader(senderId, this.messageId);
        this.writeInt32LE(0);
        this.writeInt32LE(scheduleType);
    }
}
exports.SLSendGetScheduleData = SLSendGetScheduleData;
;
//# sourceMappingURL=SLGetScheduleData.js.map