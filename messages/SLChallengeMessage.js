'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 14;

exports.SLChallengeMessage = class SLChallengeMessage extends SLMessage {
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

    this.challengeString = this.readSLString();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
