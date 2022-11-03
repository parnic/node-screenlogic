'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendGetPumpStatus = exports.SLReceiveGetPumpStatus = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 12584;
class SLReceiveGetPumpStatus extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    data;
    constructor(buf) {
        super();
        this.createFromBuffer(buf);
        this.decode();
    }
    decode() {
        super.decode();
        let pumpType = this.readUInt32LE();
        let isRunning = this.readUInt32LE() !== 0; // 0, 1, or 4294967295 (FF FF FF FF)
        let pumpWatts = this.readUInt32LE();
        let pumpRPMs = this.readUInt32LE();
        let pumpUnknown1 = this.readUInt32LE(); // Always 0
        let pumpGPMs = this.readUInt32LE();
        let pumpUnknown2 = this.readUInt32LE(); // Always 255
        let pumpCircuits = [];
        for (var i = 0; i < 8; i++) {
            let _pumpCirc = {
                circuitId: this.readUInt32LE(),
                speed: this.readUInt32LE(),
                isRPMs: this.readUInt32LE() !== 0 // 1 for RPMs; 0 for GPMs
            };
            pumpCircuits.push(_pumpCirc);
        }
        this.data = {
            pumpCircuits,
            pumpType,
            isRunning,
            pumpWatts,
            pumpRPMs,
            pumpUnknown1,
            pumpGPMs,
            pumpUnknown2
        };
    }
    get() {
        return this.data;
    }
}
exports.SLReceiveGetPumpStatus = SLReceiveGetPumpStatus;
;
class SLSendGetPumpStatus extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(pumpId) {
        super();
        this.messageId = _MSG_ID;
        this.createBaseMessage();
        // this.addHeader(this.senderId, this.messageId)
        this.writeInt32LE(0);
        this.writeInt32LE(pumpId);
    }
}
exports.SLSendGetPumpStatus = SLSendGetPumpStatus;
;
//# sourceMappingURL=SLGetPumpStatus.js.map