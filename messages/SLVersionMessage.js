'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 8120;

exports.SLVersionMessage = class SLVersionMessage extends SLMessage {
  constructor(buf) {
    super(0, MSG_ID);
    if (buf) {
      this._wroteSize = true;
      this.writeBuffer(buf, 0);

      this.decode();
    }
  }

  decode() {
    super.decode();

    this.version = this.readSLString();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
