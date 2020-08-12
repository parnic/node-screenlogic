'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12584;

exports.SLGetPumpStatus = class SLGetPumpStatus extends SLMessage {
  constructor(buf, pumpId, senderId) {
    if (buf) {
      var size = buf.readInt32LE(4) + 8;
      super(buf, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.writeInt32LE(0);
      this.writeInt32LE(pumpId);
    }
  }

  decode() {
    super.decode();

    this.pumpSetting = new Array(8);

    this.pumpType = this.readUInt32LE();
    this.isRunning = this.readUInt32LE() !== 0; // 0, 1, or 4294967295 (FF FF FF FF)
    this.pumpWatts = this.readUInt32LE();
    this.pumpRPMs = this.readUInt32LE();
    this.pumpUnknown1 = this.readUInt32LE(); // Always 0
    this.pumpGPMs = this.readUInt32LE();
    this.pumpUnknown2 = this.readUInt32LE(); // Always 255

    for (var i = 0; i < 8; i++) {
      this.pumpSetting[i] = {};
      this.pumpSetting[i].circuitId = this.readUInt32LE();
      this.pumpSetting[i].pumpSetPoint = this.readUInt32LE();
      this.pumpSetting[i].isRPMs = this.readUInt32LE() !== 0; // 1 for RPMs; 0 for GPMs
    }
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
