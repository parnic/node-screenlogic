'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12538;

exports.SLSetHeatMode = class SLSetHeatMode extends SLMessage {
  constructor(controllerIndex, bodyType, heatMode) {
    super(0, MSG_ID);

    this.controllerIndex = controllerIndex;
    this.bodyType = bodyType;
    this.heatMode = heatMode;
    // heatmodes:
    // 0: "Off", 1: "Solar", 2 : "Solar Preferred", 3 : "Heat Pump", 4: "Don't Change"
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
