"use strict";
exports.__esModule = true;
exports.ScheduleMessage = void 0;
var ScheduleMessage = /** @class */ (function () {
    function ScheduleMessage() {
    }
    ScheduleMessage.decodeGetScheduleMessage = function (msg) {
        var eventCount = msg.readUInt32LE();
        var data = [];
        for (var i = 0; i < eventCount; i++) {
            var scheduleId = msg.readUInt32LE() - 699;
            var circuitId = msg.readUInt32LE() - 499;
            var startTime = msg.decodeTime(msg.readUInt32LE());
            var stopTime = msg.decodeTime(msg.readUInt32LE());
            var dayMask = msg.readUInt32LE();
            var flags = msg.readUInt32LE();
            var heatCmd = msg.readUInt32LE();
            var heatSetPoint = msg.readUInt32LE();
            var days = msg.decodeDayMask(dayMask);
            var event_1 = {
                scheduleId: scheduleId,
                circuitId: circuitId,
                startTime: startTime,
                stopTime: stopTime,
                dayMask: dayMask,
                flags: flags,
                heatCmd: heatCmd,
                heatSetPoint: heatSetPoint,
                days: days
            };
            data.push(event_1);
        }
        return data;
    };
    ScheduleMessage.decodeAddSchedule = function (msg) {
        // ack
        return true;
    };
    ScheduleMessage.decodeDeleteSchedule = function (msg) {
        // ack
        return true;
    };
    ScheduleMessage.decodeSetSchedule = function (msg) {
        // ack
        return true;
    };
    return ScheduleMessage;
}());
exports.ScheduleMessage = ScheduleMessage;
