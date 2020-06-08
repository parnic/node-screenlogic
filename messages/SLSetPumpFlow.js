'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12586;

exports.SLSetPumpFlow = class SLSetPumpFlow extends SLMessage {
  constructor(pumpId, circuitId, setPoint, isRPMs) {
    super(0, MSG_ID);
    this.pumpId = pumpId;
    this.circuitId = circuitId;
    this.setPoint = setPoint;

    if (isRPMs === true) {
      this.isRPMs = 1;
    } else {
      this.isRPMs = 0;
    }
  }


  encode() {
    this.writeInt32LE(0); // Always 0 in my case
    this.writeInt32LE(this.pumpId); // presumably pumpId, always 0 in my case
    this.writeInt32LE(this.circuitId); // This is indexed to the array of circuits returned in GetPumpStatus
    this.writeInt32LE(this.setPoint);
    this.writeInt32LE(this.isRPMs); // 0 for GPM, 1 for RPMs

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
