'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 8112;

exports.SLSetSystemTime = class SLSetSystemTime extends SLMessage {
  constructor(buf, date, shouldAdjustForDST, senderId) {
    if (buf) {
      var size = buf.readInt32LE(4) + 8;
      super(buf, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.date = date;
      this.shouldAdjustForDST = shouldAdjustForDST;
    }
  }

  encode() {
    this.writeSLDateTime(this.date);
    this.writeInt32LE(this.shouldAdjustForDST ? 1 : 0);
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
