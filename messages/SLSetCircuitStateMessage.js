'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12530;

exports.SLSetCircuitStateMessage = class SLSetCircuitStateMessage extends SLMessage {
  constructor(controllerId, circuitId, circuitState, senderId) {
    if (typeof controllerId === 'object') {
      var size = controllerId.readInt32LE(4) + 8;
      super(controllerId, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.controllerId = controllerId;
      this.circuitId = circuitId;
      this.circuitState = circuitState;
    }
  }

  encode() {
    this.writeInt32LE(this.controllerId || 0);
    this.writeInt32LE(this.circuitId || 0);
    this.writeInt32LE(this.circuitState || 0);

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
