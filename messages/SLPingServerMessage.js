'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 16;

exports.SLPingServerMessage = class SLPingServerMessage extends SLMessage {
  constructor(buf, senderId) {
    if (buf) {
      var size = buf.readInt32LE(4) + 8;
      super(buf, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);
    }
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
