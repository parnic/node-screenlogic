'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12544;


exports.SLAddNewScheduleEvent = class SLAddNewScheduleEvent extends SLMessage {
  constructor(buf, scheduleType, senderId) {
    if (buf) {
      var size = buf.readInt32LE(4) + 8;
      super(buf, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.writeInt32LE(0);
      this.writeInt32LE(scheduleType);
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
