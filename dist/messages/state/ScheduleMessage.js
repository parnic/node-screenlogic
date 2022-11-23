"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleMessage = void 0;
class ScheduleMessage {
    static decodeGetScheduleMessage(msg) {
        let eventCount = msg.readUInt32LE();
        let data = [];
        for (var i = 0; i < eventCount; i++) {
            let scheduleId = msg.readUInt32LE() - 699;
            let circuitId = msg.readUInt32LE() - 499;
            let startTime = msg.decodeTime(msg.readUInt32LE());
            let stopTime = msg.decodeTime(msg.readUInt32LE());
            let dayMask = msg.readUInt32LE();
            let flags = msg.readUInt32LE();
            let heatCmd = msg.readUInt32LE();
            let heatSetPoint = msg.readUInt32LE();
            let days = msg.decodeDayMask(dayMask);
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
            data.push(event);
        }
        return data;
    }
    static decodeAddSchedule(msg) {
        return msg.readUInt32LE() - 699;
    }
    static decodeDeleteSchedule(msg) {
        // ack
        return true;
    }
    static decodeSetSchedule(msg) {
        // ack
        return true;
    }
}
exports.ScheduleMessage = ScheduleMessage;
//# sourceMappingURL=ScheduleMessage.js.map