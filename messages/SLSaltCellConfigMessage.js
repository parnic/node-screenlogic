'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12572;

exports.SLSaltCellConfigMessage = class SLSaltCellConfigMessage extends SLMessage {
  constructor(buf) {
    super(0, MSG_ID);
    if (!buf) {
      this.writeInt32LE(0); // controller index
    } else {
      this._wroteSize = true;
      this.writeBuffer(buf, 0);

      this.decode();
    }
  }

  decode() {
    super.decode();

    this.installed = this.readInt32LE() === 1;
    this.status = this.readInt32LE();
    this.level1 = this.readInt32LE();
    this.level2 = this.readInt32LE();
    this.salt = this.readInt32LE() * 50;
    this.flags = this.readInt32LE();
    this.superChlorTimer = this.readInt32LE();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
