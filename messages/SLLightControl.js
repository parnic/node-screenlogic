'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12556;

exports.SLLightControl = class SLLightControl extends SLMessage {
  constructor(controllerIndex, command, senderId) {
    if (typeof controllerIndex === 'object') {
      var size = controllerIndex.readInt32LE(4) + 8;
      super(controllerIndex, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.controllerIndex = controllerIndex;
      this.command = command;
    }
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
