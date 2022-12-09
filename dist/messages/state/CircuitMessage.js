"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitMessage = void 0;
class CircuitMessage {
    static decodeSetCircuit(msg) {
        return true;
    }
    static decodeSetCircuitState(msg) {
        // ack
        return true;
    }
    static decodeSetLight(msg) {
        // ack
        return true;
    }
    static decodeSetCircuitRunTime(msg) {
        // ack
        return true;
    }
}
exports.CircuitMessage = CircuitMessage;
//# sourceMappingURL=CircuitMessage.js.map