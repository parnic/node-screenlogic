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

  static getResponseId() {
    return MSG_ID + 1;
  }
};
