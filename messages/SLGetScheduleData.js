'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12542;

exports.SLGetScheduleData = class SLGetScheduleData extends SLMessage {
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

    this.eventCount = this.readUInt32LE();

    this.events = new Array(this.eventCount);

    for (var i = 0; i < this.events.length; i++) {
      this.events[i] = {};

      this.events[i].scheduleId = this.readUInt32LE();
      this.events[i].circuitId = this.readUInt32LE();
      this.events[i].startTime = this.decodeTime(this.readUInt32LE());
      this.events[i].stopTime = this.decodeTime(this.readUInt32LE());
      this.events[i].dayMask = this.readUInt32LE();
      this.events[i].flags = this.readUInt32LE();
      this.events[i].heatCmd = this.readUInt32LE();
      this.events[i].heatSetPoint = this.readUInt32LE();
      this.events[i].days = this.decodeDayMask(this.events[i].dayMask);
    }
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
