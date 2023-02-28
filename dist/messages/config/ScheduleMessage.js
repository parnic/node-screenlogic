"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleMessage = void 0;
class ScheduleMessage {
    static decodeGetScheduleMessage(msg) {
        const eventCount = msg.readUInt32LE();
        const data = [];
        for (let i = 0; i < eventCount; i++) {
            const scheduleId = msg.readUInt32LE() - 699;
            const circuitId = msg.readUInt32LE() - 499;
            const startTime = msg.decodeTime(msg.readUInt32LE());
            const stopTime = msg.decodeTime(msg.readUInt32LE());
            const dayMask = msg.readUInt32LE();
            const flags = msg.readUInt32LE();
            const heatCmd = msg.readUInt32LE();
            const heatSetPoint = msg.readUInt32LE();
            const days = msg.decodeDayMask(dayMask);
            const event = {
                senderId: msg.senderId,
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
        const response = {
            senderId: msg.senderId,
            val: msg.readUInt32LE() - 699
        };
        return response;
    }
    static decodeDeleteSchedule(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
    static decodeSetSchedule(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
}
exports.ScheduleMessage = ScheduleMessage;
//# sourceMappingURL=ScheduleMessage.js.map