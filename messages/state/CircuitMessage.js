"use strict";
exports.__esModule = true;
exports.CircuitMessage = void 0;
var CircuitMessage = /** @class */ (function () {
    function CircuitMessage() {
    }
    CircuitMessage.decodeSetCircuitState = function (msg) {
        // ack
        return true;
    };
    CircuitMessage.decodeSetLight = function (msg) {
        // ack
        return true;
    };
    CircuitMessage.decodeSetCircuitRunTime = function (msg) {
        // ack
        return true;
    };
    return CircuitMessage;
}());
exports.CircuitMessage = CircuitMessage;
