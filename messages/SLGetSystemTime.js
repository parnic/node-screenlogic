'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 8110;

exports.SLGetSystemTime = class SLGetSystemTime extends SLMessage {
  constructor(buf, senderId) {
    if (buf) {
      var size = buf.readInt32LE(4) + 8;
      super(buf, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);
    }
  }

  decode() {
    super.decode();

    this.year = this.readUInt16LE();
    this.month = this.readUInt16LE();
    this.dayOfWeek = this.readUInt16LE();
    this.day = this.readUInt16LE();
    this.hour = this.readUInt16LE();
    this.minute = this.readUInt16LE();
    this.second = this.readUInt16LE();
    this.millisecond = this.readUInt16LE();
    var adjustForDST = this.readInt32LE();
    this.adjustForDST = adjustForDST === 1;

    this.date = new Date(this.year, this.month - 1, this.day, this.hour, this.minute, this.second);
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
