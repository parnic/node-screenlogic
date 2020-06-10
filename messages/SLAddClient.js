'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12522;

exports.SLAddClient = class SLAddClient extends SLMessage {
  constructor(senderId) {
    super(0, MSG_ID);

    this.senderId = senderId;
  }

  encode() {
    this.writeInt32LE(0);
    this.writeInt32LE(this.senderId);

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
