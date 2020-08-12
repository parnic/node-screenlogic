'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12538;

exports.SLSetHeatMode = class SLSetHeatMode extends SLMessage {
  constructor(controllerIndex, bodyType, heatMode, senderId) {
    if (typeof controllerIndex === 'object') {
      var size = controllerIndex.readInt32LE(4) + 8;
      super(controllerIndex, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.controllerIndex = controllerIndex;
      this.bodyType = bodyType;
      this.heatMode = heatMode;
    }
  }

  encode() {
    this.writeInt32LE(this.controllerIndex || 0);
    this.writeInt32LE(this.bodyType || 0);
    this.writeInt32LE(this.heatMode || 0);

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
