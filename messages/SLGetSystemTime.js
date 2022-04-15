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

    this.date = this.readSLDateTime();
    this.year = this.date.getFullYear();
    this.month = this.date.getMonth() + 1; // + 1 is for backward compatibility, SLTime represents months as 1-based
    this.dayOfWeek = this.date.getDay(); // should probably be tweaked to adjust what days are 0-6 as SLTime and Javascript start on different days of the week
    this.day = this.date.getDate();
    this.hour = this.date.getHours();
    this.minute = this.date.getMinutes();
    this.second = this.date.getSeconds();
    this.millisecond = this.date.getMilliseconds();

    var adjustForDST = this.readInt32LE();
    this.adjustForDST = adjustForDST === 1;
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
