"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpMessage = void 0;
const index_1 = require("../../index");
class PumpMessage {
    static decodePumpStatus(msg) {
        // This pump type seems to be different:
        // 1 = VF
        // 2 = VS
        // 3 = VSF
        // The equipmentConfig message gives more specifics on the pump type
        const _pumpType = msg.readUInt32LE();
        const pumpType = _pumpType === 1 ? index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVF : _pumpType === 2 ? index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVS : _pumpType === 3 ? index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVSF : _pumpType;
        const isRunning = msg.readUInt32LE() !== 0; // 0, 1, or 4294967295 (FF FF FF FF)
        const pumpWatts = msg.readUInt32LE();
        const pumpRPMs = msg.readUInt32LE();
        const pumpUnknown1 = msg.readUInt32LE(); // Always 0
        const pumpGPMs = msg.readUInt32LE();
        const pumpUnknown2 = msg.readUInt32LE(); // Always 255
        const pumpCircuits = [];
        for (let i = 0; i < 8; i++) {
            const _pumpCirc = {
                circuitId: msg.readUInt32LE(),
                speed: msg.readUInt32LE(),
                isRPMs: msg.readUInt32LE() !== 0 // 1 for RPMs; 0 for GPMs
            };
            pumpCircuits.push(_pumpCirc);
        }
        const data = {
            senderId: msg.senderId,
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
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
}
exports.PumpMessage = PumpMessage;
(function (PumpMessage) {
    let ResponseIDs;
    (function (ResponseIDs) {
        ResponseIDs[ResponseIDs["PumpStatus"] = 12585] = "PumpStatus";
        ResponseIDs[ResponseIDs["SetPumpSpeed"] = 12587] = "SetPumpSpeed";
    })(ResponseIDs = PumpMessage.ResponseIDs || (PumpMessage.ResponseIDs = {}));
})(PumpMessage = exports.PumpMessage || (exports.PumpMessage = {}));
//# sourceMappingURL=PumpMessage.js.map