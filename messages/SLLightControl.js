'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12556;

exports.SLLightControl = class SLLightControl extends SLMessage {
  constructor(controllerIndex, command) {
    super(0, MSG_ID);

    this.controllerIndex = controllerIndex;
    this.command = command;
  }

  encode() {
    this.writeInt32LE(this.controllerIndex || 0);
    this.writeInt32LE(this.command || 0);

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
