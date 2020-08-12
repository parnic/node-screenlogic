'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12532;

const CIRCUIT_NAME_VALUE_MAP = [
  {name: 'Unused', deviceId: 0},
  {name: 'Solar Active', deviceId: 128},
  {name: 'Pool or Spa Heater Active', deviceId: 129},
  {name: 'Pool Heater Active', deviceId: 130},
  {name: 'Spa Heater Active', deviceId: 131},
];

exports.SLControllerConfigMessage = class SLControllerConfigMessage extends SLMessage {
  constructor(buf, senderId) {
    if (buf) {
      var size = buf.readInt32LE(4) + 8;
      super(buf, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.writeInt32LE(0);
      this.writeInt32LE(0);
    }
  }

  decode() {
    super.decode();

    this.controllerId = this.readInt32LE();

    this.minSetPoint = new Array(2);
    this.maxSetPoint = new Array(2);
    for (let i = 0; i < 2; i++) {
      this.minSetPoint[i] = this.readUInt8();
      this.maxSetPoint[i] = this.readUInt8();
    }

    this.degC = this.readUInt8() !== 0;
    this.controllerType = this.readUInt8();
    this.hwType = this.readUInt8();
    this.controllerData = this.readUInt8();
    this.equipFlags = this.readInt32LE();
    this.genCircuitName = this.readSLString();

    let circuitCount = this.readInt32LE();
    this.bodyArray = new Array(circuitCount);
    for (let i = 0; i < circuitCount; i++) {
      this.bodyArray[i] = {
        circuitId: this.readInt32LE(),
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
      this._readOffset += 2;
    }

    let colorCount = this.readInt32LE();
    this.colorArray = new Array(colorCount);
    for (let i = 0; i < colorCount; i++) {
      this.colorArray[i] = {
        name: this.readSLString(),
        color: {
          r: this.readInt32LE() & 0xff,
          g: this.readInt32LE() & 0xff,
          b: this.readInt32LE() & 0xff,
        },
      };
    }

    let pumpCircCount = 8;
    this.pumpCircArray = new Array(pumpCircCount);
    for (let i = 0; i < pumpCircCount; i++) {
      this.pumpCircArray[i] = this.readUInt8();
    }

    this.interfaceTabFlags = this.readInt32LE();
    this.showAlarms = this.readInt32LE();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }

  hasSolar() {
    return !!(this.equipFlags & 0x1);
  }

  hasSolarAsHeatpump() {
    return !!(this.equipFlags & 0x2);
  }

  hasChlorinator() {
    return !!(this.equipFlags & 0x4);
  }

  hasCooling() {
    return !!(this.equipFlags & 0x800);
  }

  hasIntellichem() {
    return !!(this.equipFlags & 0x8000);
  }

  isEasyTouch() {
    return this.controllerType === 14 || this.controllerType === 13;
  }

  isIntelliTouch() {
    return this.controllerType !== 14 && this.controllerType !== 13 && this.controllerType !== 10;
  }

  isEasyTouchLite() {
    return this.controllerType === 13 && (this.hwType & 4) !== 0;
  }

  isDualBody() {
    return this.controllerType === 5;
  }

  isChem2() {
    return this.controllerType === 252 && this.hwType === 2;
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

    if (this.bodyArray) {
      deviceArray = this.bodyArray.concat(CIRCUIT_NAME_VALUE_MAP);
    } else {
      deviceArray = [].concat(CIRCUIT_NAME_VALUE_MAP);
    }

    return deviceArray;
  }

};
