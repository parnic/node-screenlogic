'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12524;

exports.SLRemoveClient = class SLRemoveClient extends SLMessage {
  constructor() {
    super(0, MSG_ID);

  }

  encode() {
    this.writeInt32LE(0);
    this.writeInt32LE(9001); // This is supposed to be a random number, i guess to identify clients, but i dont see how it makes a difference

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
