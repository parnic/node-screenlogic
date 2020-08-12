'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12522;

exports.SLAddClient = class SLAddClient extends SLMessage {
  constructor(clientId, senderId) {
    super(senderId, MSG_ID);

    this.clientId = clientId;
  }

  encode() {
    this.writeInt32LE(0);
    this.writeInt32LE(this.clientId);

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
