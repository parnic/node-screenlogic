'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12576;

exports.SLSetSaltCellConfigMessage = class SLSetSaltCellConfigMessage extends SLMessage {
  constructor(controllerIndex, poolOutput, spaOutput) {
    super(0, MSG_ID);

    this.controllerIndex = controllerIndex;
    this.poolOutput = poolOutput;
    this.spaOutput = spaOutput;
  }

  encode() {
    this.writeInt32LE(this.controllerIndex || 0);
    this.writeInt32LE(this.poolOutput || 0);
    this.writeInt32LE(this.spaOutput || 0);
    this.writeInt32LE(0);
    this.writeInt32LE(0);

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
