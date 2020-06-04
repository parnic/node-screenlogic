'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12548;


exports.SLSetScheduleEventById = class SLSetScheduleEventById extends SLMessage {
  constructor(buf, scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint) {
    var size;
    if (buf) {
      size = buf.readInt32LE(4) + 8;
    }
    super(0, MSG_ID, size);


    if (!buf) {
      this.writeInt32LE(0);
      this.writeInt32LE(scheduleId);
      this.writeInt32LE(circuitId);
      this.writeInt32LE(startTime);
      this.writeInt32LE(stopTime);
      this.writeInt32LE(dayMask);
      this.writeInt32LE(flags);
      this.writeInt32LE(heatCmd);
      this.writeInt32LE(heatSetPoint);
    } else {
      this._wroteSize = true;
      this.writeBuffer(buf, 0);

      this.decode();
    }
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
