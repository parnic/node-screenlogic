'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12548;


exports.SLSetScheduleEventById = class SLSetScheduleEventById extends SLMessage {
  constructor(buf, scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint, senderId) {
    if (buf) {
      var size = buf.readInt32LE(4) + 8;
      super(buf, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.writeInt32LE(0);
      this.writeInt32LE(scheduleId);
      this.writeInt32LE(circuitId);
      this.writeInt32LE(startTime);
      this.writeInt32LE(stopTime);
      this.writeInt32LE(dayMask);
      this.writeInt32LE(flags);
      this.writeInt32LE(heatCmd);
      this.writeInt32LE(heatSetPoint);
    }
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
