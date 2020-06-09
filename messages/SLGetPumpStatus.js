'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12584;

exports.SLGetPumpStatus = class SLGetPumpStatus extends SLMessage {
  constructor(buf, pumpId) {
    var size;
    if (buf) {
      size = buf.readInt32LE(4) + 8;
    }
    super(0, MSG_ID, size);

    if (!buf) {
      this.writeInt32LE(0);
      this.writeInt32LE(pumpId);
    } else {
      this._wroteSize = true;
      this.writeBuffer(buf, 0);

      this.decode();
    }
  }

  decode() {
    super.decode();

    this.pumpSetting = new Array(8);

    this.pumpType = this.readUInt32LE();
    this.isRunning = this.readUInt32LE() !== 0; // Sometimes 1, sometimes 4294967295 (FF FF FF FF)
    this.pumpWatts = this.readUInt32LE();
    this.pumpRPMs = this.readUInt32LE();
    this.pump_unknown = this.readUInt32LE();
    this.pumpGPMs = this.readUInt32LE();
    this.val2 = this.readUInt32LE(); // Always 255

    for (var i = 0; i < 8; i++) {
      this.pumpSetting[i] = {};
      this.pumpSetting[i].circuitId = this.readUInt32LE();
      this.pumpSetting[i].pumpSetPoint = this.readUInt32LE();
      this.pumpSetting[i].isRPMs = this.readUInt32LE(); // 1 for RPMs; 0 for GPMs
    }
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
