'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12550;


exports.SLSetCircuitRuntimeById = class SLSetCircuitRuntimeById extends SLMessage {
  constructor(circuitId, runTime, senderId) {
    super(senderId, MSG_ID);

    this.circuitId = circuitId;
    this.runTime = runTime;
  }

  encode() {
    this.writeInt32LE(0);
    this.writeInt32LE(this.circuitId);
    this.writeInt32LE(this.runTime);

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
