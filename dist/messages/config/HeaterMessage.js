"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaterMessage = void 0;
class HeaterMessage {
    static decodeSetHeatSetPoint(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
    static decodeCoolSetHeatSetPoint(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
    static decodeSetHeatModePoint(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
}
exports.HeaterMessage = HeaterMessage;
(function (HeaterMessage) {
    let ResponseIDs;
    (function (ResponseIDs) {
        ResponseIDs[ResponseIDs["SetHeatSetPoint"] = 12529] = "SetHeatSetPoint";
        ResponseIDs[ResponseIDs["SetHeatMode"] = 12539] = "SetHeatMode";
        ResponseIDs[ResponseIDs["SetCoolSetPoint"] = 12591] = "SetCoolSetPoint";
    })(ResponseIDs = HeaterMessage.ResponseIDs || (HeaterMessage.ResponseIDs = {}));
})(HeaterMessage = exports.HeaterMessage || (exports.HeaterMessage = {}));
//# sourceMappingURL=HeaterMessage.js.map