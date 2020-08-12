'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12580;

exports.SLCancelDelay = class SLCancelDelay extends SLMessage {
  constructor(senderId) {
    super(senderId, MSG_ID);
  }

  encode() {
    this.writeInt32LE(0);

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
