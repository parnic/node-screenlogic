'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendControllerConfigMessage = exports.SLReceiveControllerConfigMessage = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 12532;
const CIRCUIT_NAME_VALUE_MAP = [
    { name: 'Unused', deviceId: 0 },
    { name: 'Solar Active', deviceId: 128 },
    { name: 'Pool or Spa Heater Active', deviceId: 129 },
    { name: 'Pool Heater Active', deviceId: 130 },
    { name: 'Spa Heater Active', deviceId: 131 },
];
class SLReceiveControllerConfigMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(buf) {
        super();
        this.createFromBuffer(buf);
        this.decode();
    }
    data;
    decode() {
        super.decode();
        let controllerId = this.readInt32LE();
        let minSetPoint = new Array(2);
        let maxSetPoint = new Array(2);
        for (let i = 0; i < 2; i++) {
            minSetPoint[i] = this.readUInt8();
            maxSetPoint[i] = this.readUInt8();
        }
        let degC = this.readUInt8() !== 0;
        let controllerType = this.readUInt8();
        let hwType = this.readUInt8();
        let controllerData = this.readUInt8();
        let equipFlags = this.readInt32LE();
        let genCircuitName = this.readSLString();
        let circuitCount = this.readInt32LE();
        let bodyArray = new Array(circuitCount);
        for (let i = 0; i < circuitCount; i++) {
            bodyArray[i] = {
                circuitId: this.readInt32LE() - 499,
                name: this.readSLString(),
                nameIndex: this.readUInt8(),
                function: this.readUInt8(),
                interface: this.readUInt8(),
                flags: this.readUInt8(),
                colorSet: this.readUInt8(),
                colorPos: this.readUInt8(),
                colorStagger: this.readUInt8(),
                deviceId: this.readUInt8(),
                dfaultRt: this.readUInt16LE(),
            };
            this.incrementReadOffset(2);
        }
        let colorCount = this.readInt32LE();
        let colorArray = new Array(colorCount);
        for (let i = 0; i < colorCount; i++) {
            colorArray[i] = {
                name: this.readSLString(),
                color: {
                    r: this.readInt32LE() & 0xff,
                    g: this.readInt32LE() & 0xff,
                    b: this.readInt32LE() & 0xff,
                },
            };
        }
        let pumpCircCount = 8;
        let pumpCircArray = new Array(pumpCircCount);
        for (let i = 0; i < pumpCircCount; i++) {
            pumpCircArray[i] = this.readUInt8();
        }
        let interfaceTabFlags = this.readInt32LE();
        let showAlarms = this.readInt32LE();
        this.data = {
            controllerId,
            minSetPoint,
            maxSetPoint,
            degC,
            controllerType,
            hwType,
            controllerData,
            equipFlags,
            genCircuitName,
            circuitCount,
            bodyArray,
            colorCount,
            colorArray,
            pumpCircCount,
            pumpCircArray,
            interfaceTabFlags,
            showAlarms
        };
    }
    static getResponseId() {
        return this.MSG_ID + 1;
    }
    hasSolar() {
        return !!(this.data.equipFlags & 0x1);
    }
    hasSolarAsHeatpump() {
        return !!(this.data.equipFlags & 0x2);
    }
    hasChlorinator() {
        return !!(this.data.equipFlags & 0x4);
    }
    hasCooling() {
        return !!(this.data.equipFlags & 0x800);
    }
    hasIntellichem() {
        return !!(this.data.equipFlags & 0x8000);
    }
    isEasyTouch() {
        return this.data.controllerType === 14 || this.data.controllerType === 13;
    }
    isIntelliTouch() {
        return this.data.controllerType !== 14 && this.data.controllerType !== 13 && this.data.controllerType !== 10;
    }
    isEasyTouchLite() {
        return this.data.controllerType === 13 && (this.data.hwType & 4) !== 0;
    }
    isDualBody() {
        return this.data.controllerType === 5;
    }
    isChem2() {
        return this.data.controllerType === 252 && this.data.hwType === 2;
    }
    getCircuitByDeviceId(deviceId) {
        var deviceArray = this.getCircuitsMap();
        for (var i = 0; i < deviceArray.length; i++) {
            if (deviceArray[i].deviceId === deviceId) {
                return deviceArray[i];
            }
        }
        return null;
    }
    getCircuitsMap() {
        var deviceArray;
        if (this.data.bodyArray) {
            deviceArray = this.data.bodyArray.concat(CIRCUIT_NAME_VALUE_MAP);
        }
        else {
            deviceArray = [].concat(CIRCUIT_NAME_VALUE_MAP);
        }
        return deviceArray;
    }
    get() {
        return this.data;
    }
}
exports.SLReceiveControllerConfigMessage = SLReceiveControllerConfigMessage;
;
class SLSendControllerConfigMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(senderId) {
        super();
        this.createBaseMessage();
        // this.addHeader(senderId, _MSG_ID);
        this.writeInt32LE(0);
        this.writeInt32LE(0);
    }
}
exports.SLSendControllerConfigMessage = SLSendControllerConfigMessage;
;
//# sourceMappingURL=SLControllerConfigMessage.js.map