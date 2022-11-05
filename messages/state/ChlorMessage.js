"use strict";
exports.__esModule = true;
exports.ChlorMessage = void 0;
var ChlorMessage = /** @class */ (function () {
    function ChlorMessage() {
    }
    ChlorMessage.decodeIntellichlorConfig = function (msg) {
        var data = {
            installed: msg.readInt32LE() === 1,
            status: msg.readInt32LE(),
            poolSetPoint: msg.readInt32LE(),
            spaSetPoint: msg.readInt32LE(),
            salt: msg.readInt32LE() * 50,
            flags: msg.readInt32LE(),
            superChlorTimer: msg.readInt32LE()
        };
        return data;
    };
    ChlorMessage.decodeSetIntellichlorConfig = function (msg) {
        // ack
        return true;
    };
    return ChlorMessage;
}());
exports.ChlorMessage = ChlorMessage;
