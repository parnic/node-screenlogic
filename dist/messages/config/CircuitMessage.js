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
(function (CircuitMessage) {
    let ResponseIDs;
    (function (ResponseIDs) {
        ResponseIDs[ResponseIDs["LightSequence"] = 12504] = "LightSequence";
        ResponseIDs[ResponseIDs["SetCircuitInfo"] = 12521] = "SetCircuitInfo";
        ResponseIDs[ResponseIDs["SetCircuitState"] = 12531] = "SetCircuitState";
        ResponseIDs[ResponseIDs["SetCircuitRunTime"] = 12551] = "SetCircuitRunTime";
        ResponseIDs[ResponseIDs["SetLightState"] = 12557] = "SetLightState";
    })(ResponseIDs = CircuitMessage.ResponseIDs || (CircuitMessage.ResponseIDs = {}));
})(CircuitMessage = exports.CircuitMessage || (exports.CircuitMessage = {}));
//# sourceMappingURL=CircuitMessage.js.map