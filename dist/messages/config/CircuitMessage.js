"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitMessage = void 0;
class CircuitMessage {
    static decodeSetCircuit(msg) {
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
    static decodeSetCircuitState(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
    static decodeSetLight(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
    static decodeSetCircuitRunTime(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
}
exports.CircuitMessage = CircuitMessage;
//# sourceMappingURL=CircuitMessage.js.map