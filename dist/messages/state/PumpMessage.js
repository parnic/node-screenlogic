"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpMessage = void 0;
class PumpMessage {
    static decodePumpStatus(msg) {
        let pumpType = msg.readUInt32LE();
        let isRunning = msg.readUInt32LE() !== 0; // 0, 1, or 4294967295 (FF FF FF FF)
        let pumpWatts = msg.readUInt32LE();
        let pumpRPMs = msg.readUInt32LE();
        let pumpUnknown1 = msg.readUInt32LE(); // Always 0
        let pumpGPMs = msg.readUInt32LE();
        let pumpUnknown2 = msg.readUInt32LE(); // Always 255
        let pumpCircuits = [];
        for (var i = 0; i < 8; i++) {
            let _pumpCirc = {
                circuitId: msg.readUInt32LE(),
                speed: msg.readUInt32LE(),
                isRPMs: msg.readUInt32LE() !== 0 // 1 for RPMs; 0 for GPMs
            };
            pumpCircuits.push(_pumpCirc);
        }
        let data = {
            pumpCircuits,
            pumpType,
            isRunning,
            pumpWatts,
            pumpRPMs,
            pumpUnknown1,
            pumpGPMs,
            pumpUnknown2
        };
        return data;
    }
    static decodeSetPumpSpeed(msg) {
        // ack
        return true;
    }
}
exports.PumpMessage = PumpMessage;
//# sourceMappingURL=PumpMessage.js.map