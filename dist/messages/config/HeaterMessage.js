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
//# sourceMappingURL=HeaterMessage.js.map