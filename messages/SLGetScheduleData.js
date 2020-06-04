'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12542;

exports.SLGetScheduleData = class SLGetScheduleData extends SLMessage {
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

    this.eventCount = this.readUInt32LE();

    this.events = new Array(this.eventCount);

    for (var i = 0; i < this.events.length; i++) {
      this.events[i] = {};

      this.events[i].scheduleId = this.readUInt32LE();
      this.events[i].circuitId = this.readUInt32LE();
      this.events[i].startTime = this.readTime(this.readUInt32LE());
      this.events[i].stopTime = this.readTime(this.readUInt32LE());
      this.events[i].dayMask = this.readUInt32LE();
      this.events[i].flags = this.readUInt32LE();
      this.events[i].heatCmd = this.readUInt32LE();
      this.events[i].heatSetPoint = this.readUInt32LE();

    }
  }

  readTime(rawTime) {
    var retVal;

    retVal = Math.floor(rawTime / 60) * 100 + rawTime % 60;

    retVal = String(retVal).padStart(4, '0');

    return retVal;
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
