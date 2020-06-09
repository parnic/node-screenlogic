'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12566;

exports.SLEquipmentConfigurationMessage = class SLEquipmentConfigurationMessage extends SLMessage {
  constructor(buf) {
    var size;
    if (buf) {
      size = buf.readInt32LE(4) + 8;
    }
    super(0, MSG_ID, size);

    if (!buf) {
      this.writeInt32LE(0);
      this.writeInt32LE(0);
    } else {
      this._wroteSize = true;
      this.writeBuffer(buf, 0);

      this.decode();
    }
  }

  decode() {
    super.decode();

    this.controllerType = this.readUInt8();
    this.hardwareType = this.readUInt8();
    this.readUInt8();
    this.readUInt8();
    this.controllerData = this.readInt32LE();
    this.versionDataArray = this.readSLArray();
    this.speedDataArray = this.readSLArray();
    this.valveDataArray = this.readSLArray();
    this.remoteDataArray = this.readSLArray();
    this.sensorDataArray = this.readSLArray();
    this.delayDataArray = this.readSLArray();
    this.macroDataArray = this.readSLArray();
    this.miscDataArray = this.readSLArray();
    this.lightDataArray = this.readSLArray();
    this.flowDataArray = this.readSLArray();
    this.sgDataArray = this.readSLArray();
    this.spaFlowDataArray = this.readSLArray();
  }

  getVersion() {
    if (this.versionDataArray === null || this.versionDataArray.length < 2) {
      return 0;
    }

    return (this.versionDataArray[0] * 1000) + (this.versionDataArray[1]);
  }

  getSecondariesCount() {
    return (this.controllerData & 0x11000000) >> 6;
  }

  getPumpType(pumpIndex) {
    if (typeof (pumpIndex) !== 'number') {
      return 0;
    }

    if (this.flowDataArray === null || this.flowDataArray.length < (pumpIndex + 1) * 45) {
      return 0;
    }

    let pumpType = this.flowDataArray[(45 * pumpIndex) + 2];
    if (pumpType <= 3) {
      return pumpType;
    }

    return 0;
  }

  getCircuitRPMs(pumpIndex, circuitDeviceId) {
    if (typeof (pumpIndex) !== 'number' || typeof (circuitDeviceId) !== 'number') {
      return 0;
    }

    if (pumpIndex < 0 || pumpIndex >= 8) {
      return 0;
    }

    if (this.flowDataArray === null || this.flowDataArray.length < (pumpIndex + 1) * 45) {
      return 0;
    }

    for (var i = 0; i < 8; i++) {
      let offset = (45 * pumpIndex) + 4 + (i * 2);
      if (this.flowDataArray[offset] === circuitDeviceId) {
        let upperBits = this.flowDataArray[offset + 1];
        let lowerBits = this.flowDataArray[offset + (16 - (i * 2)) + 1 + i];
        return (upperBits << 8) + lowerBits;
      }
    }

    return 0;
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
