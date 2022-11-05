"use strict";
exports.__esModule = true;
exports.PumpMessage = void 0;
var PumpMessage = /** @class */ (function () {
    function PumpMessage() {
    }
    PumpMessage.decodePumpStatus = function (msg) {
        var pumpType = msg.readUInt32LE();
        var isRunning = msg.readUInt32LE() !== 0; // 0, 1, or 4294967295 (FF FF FF FF)
        var pumpWatts = msg.readUInt32LE();
        var pumpRPMs = msg.readUInt32LE();
        var pumpUnknown1 = msg.readUInt32LE(); // Always 0
        var pumpGPMs = msg.readUInt32LE();
        var pumpUnknown2 = msg.readUInt32LE(); // Always 255
        var pumpCircuits = [];
        for (var i = 0; i < 8; i++) {
            var _pumpCirc = {
                circuitId: msg.readUInt32LE(),
                speed: msg.readUInt32LE(),
                isRPMs: msg.readUInt32LE() !== 0 // 1 for RPMs; 0 for GPMs
            };
            pumpCircuits.push(_pumpCirc);
        }
        var data = {
            pumpCircuits: pumpCircuits,
            pumpType: pumpType,
            isRunning: isRunning,
            pumpWatts: pumpWatts,
            pumpRPMs: pumpRPMs,
            pumpUnknown1: pumpUnknown1,
            pumpGPMs: pumpGPMs,
            pumpUnknown2: pumpUnknown2
        };
        return data;
    };
    PumpMessage.decodeSetPumpSpeed = function (msg) {
        // ack
        return true;
    };
    return PumpMessage;
}());
exports.PumpMessage = PumpMessage;
