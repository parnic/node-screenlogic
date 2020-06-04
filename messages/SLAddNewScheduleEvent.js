'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12544;


exports.SLAddNewScheduleEvent = class SLAddNewScheduleEvent extends SLMessage {
  constructor(buf, scheduleType) {
    var size;
    if (buf) {
      size = buf.readInt32LE(4) + 8;
    }
    super(0, MSG_ID, size);


    if (!buf) {
      // console.log('Requested Schedule type = ', scheduleType);
      this.writeInt32LE(0);
      this.writeInt32LE(scheduleType);
    } else {
      this._wroteSize = true;
      this.writeBuffer(buf, 0);

      this.decode();
    }
  }

  decode() {
    super.decode();

    this.scheduleId = this.readUInt32LE();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
