'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12546;

exports.SLDeleteScheduleEventById = class SLDeleteScheduleEventById extends SLMessage {
  constructor(scheduleId) {
    super(0, MSG_ID);

    this.writeInt32LE(0);
    this.writeInt32LE(scheduleId);
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
