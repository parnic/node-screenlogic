// TODO: Change data format to body1: {} and body2: {}
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLReceivePoolStatusMessage = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 12526;
const _ASYNC_MSG_ID = 12500;
const _SPA_CIRCUIT_ID = 1;
const _POOL_CIRCUIT_ID = 6;
class SLReceivePoolStatusMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    data;
    constructor(buf) {
        super();
        this.messageId = _MSG_ID;
        this.createFromBuffer(buf);
        this.decode();
    }
    decode() {
        super.decode();
        let ok = this.readInt32LE();
        let freezeMode = this.readUInt8();
        let remotes = this.readUInt8();
        let poolDelay = this.readUInt8();
        let spaDelay = this.readUInt8();
        let cleanerDelay = this.readUInt8();
        this.incrementReadOffset(3);
        let airTemp = this.readInt32LE();
        let bodiesCount = this.readInt32LE();
        if (bodiesCount > 2) {
            bodiesCount = 2;
        }
        let currentTemp = new Array(bodiesCount);
        let heatStatus = new Array(bodiesCount);
        let setPoint = new Array(bodiesCount);
        let coolSetPoint = new Array(bodiesCount);
        let heatMode = new Array(bodiesCount);
        let bodies = [{ id: 1 }, bodiesCount > 1 ? { id: 2 } : undefined];
        for (let i = 0; i < bodiesCount; i++) {
            let bodyType = this.readInt32LE();
            if (bodyType < 0 || bodyType >= 2) {
                bodyType = 0;
            }
            bodies[bodyType].currentTemp = currentTemp[bodyType] = this.readInt32LE();
            bodies[bodyType].heatStatus = heatStatus[bodyType] = this.readInt32LE();
            bodies[bodyType].setPoint = setPoint[bodyType] = this.readInt32LE();
            bodies[bodyType].coolSetPoint = coolSetPoint[bodyType] = this.readInt32LE();
            bodies[bodyType].heatMode = heatMode[bodyType] = this.readInt32LE();
        }
        let circuitCount = this.readInt32LE();
        let circuitArray = new Array(circuitCount);
        for (let i = 0; i < circuitCount; i++) {
            circuitArray[i] = {
                id: this.readInt32LE() - 499,
                state: this.readInt32LE(),
                colorSet: this.readUInt8(),
                colorPos: this.readUInt8(),
                colorStagger: this.readUInt8(),
                delay: this.readUInt8(),
            };
        }
        let pH = this.readInt32LE() / 100;
        let orp = this.readInt32LE();
        let saturation = this.readInt32LE() / 100;
        let saltPPM = this.readInt32LE() * 50;
        let pHTank = this.readInt32LE();
        let orpTank = this.readInt32LE();
        let alarms = this.readInt32LE();
        this.data = {
            ok,
            freezeMode,
            remotes,
            poolDelay,
            spaDelay,
            cleanerDelay,
            airTemp,
            bodiesCount,
            bodies,
            currentTemp,
            heatStatus,
            setPoint,
            coolSetPoint,
            heatMode,
            circuitArray,
            pH,
            orp,
            saturation,
            saltPPM,
            pHTank,
            orpTank,
            alarms,
        };
    }
    isDeviceReady() {
        return this.data.ok === 1;
    }
    isDeviceSync() {
        return this.data.ok === 2;
    }
    isDeviceServiceMode() {
        return this.data.ok === 3;
    }
    circuitData(id) {
        for (let i = 0; i < this.data.circuitArray.length; i++) {
            if (this.data.circuitArray[i].id === id) {
                return this.data.circuitArray[i];
            }
        }
        return undefined;
    }
    isSpaActive() {
        return this.circuitData(_SPA_CIRCUIT_ID).state === 1;
    }
    isPoolActive() {
        return this.circuitData(_POOL_CIRCUIT_ID).state === 1;
    }
    static getAsyncResponseId() {
        return _ASYNC_MSG_ID;
    }
    get() {
        return this.data;
    }
}
exports.SLReceivePoolStatusMessage = SLReceivePoolStatusMessage;
;
//# sourceMappingURL=SLPoolStatusMessage.js.map