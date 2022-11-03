'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendSetCircuitStateMessage = exports.SLReceiveSetCircuitStateMessage = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 12530;
class SLReceiveSetCircuitStateMessage extends SLMessage_1.SLMessage {
    constructor(buf) {
        super();
        this.messageId = _MSG_ID;
        this.createFromBuffer(buf);
        // this.decode();
    }
}
exports.SLReceiveSetCircuitStateMessage = SLReceiveSetCircuitStateMessage;
;
class SLSendSetCircuitStateMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    _controllerId;
    _circuitId;
    _circuitState;
    constructor(controllerId, circuitId, circuitState) {
        super();
        this.messageId = _MSG_ID;
        this.createBaseMessage();
        // this.addHeader(this.senderId, this.messageId);
        this._controllerId = controllerId;
        this._circuitId = circuitId;
        this._circuitState = circuitState ? 1 : 0;
        this.encode();
    }
    encode() {
        this.writeInt32LE(this._controllerId || 0);
        this.writeInt32LE(this._circuitId || 0);
        this.writeInt32LE(this._circuitState || 0);
        super.encode();
    }
}
exports.SLSendSetCircuitStateMessage = SLSendSetCircuitStateMessage;
;
//# sourceMappingURL=SLSetCircuitStateMessage.js.map