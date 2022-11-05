"use strict";
exports.__esModule = true;
exports.HeaterMessage = void 0;
var HeaterMessage = /** @class */ (function () {
    function HeaterMessage() {
    }
    HeaterMessage.decodeSetHeatSetPoint = function (msg) {
        // ack
        return true;
    };
    HeaterMessage.decodeSetHeatModePoint = function (msg) {
        // ack
        return true;
    };
    return HeaterMessage;
}());
exports.HeaterMessage = HeaterMessage;
