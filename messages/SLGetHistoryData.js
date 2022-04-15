'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12534;
const PAYLOAD_MSG_ID = 12502;

exports.SLGetHistoryData = class SLGetHistoryData extends SLMessage {
  constructor(buf, fromTime, toTime, senderId) {
    if (buf) {
      var size = buf.readInt32LE(4) + 8;
      super(buf, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.writeInt32LE(0);
      this.writeSLDateTime(fromTime);
      this.writeSLDateTime(toTime);
      this.writeInt32LE(senderId || 0);
    }
  }

  decode() {
    super.decode();

    this.airTemps = this.readTimeTempPointsPairs();
    this.poolTemps = this.readTimeTempPointsPairs();
    this.poolSetPointTemps = this.readTimeTempPointsPairs();
    this.spaTemps = this.readTimeTempPointsPairs();
    this.spaSetPointTemps = this.readTimeTempPointsPairs();
    this.poolRuns = this.readTimeTimePointsPairs();
    this.spaRuns = this.readTimeTimePointsPairs();
    this.solarRuns = this.readTimeTimePointsPairs();
    this.heaterRuns = this.readTimeTimePointsPairs();
    this.lightRuns = this.readTimeTimePointsPairs();
  }

  readTimeTempPointsPairs() {
    let retval = [];
    // 4 bytes for the length
    if (this.length >= this.readOffset + 4) {
      let points = this.readInt32LE();
      // 16 bytes per time, 4 bytes per temperature
      if (this.length >= this.readOffset + (points * (16 + 4))) {
        for (let i = 0; i < points; i++) {
          let time = this.readSLDateTime();
          let temp = this.readInt32LE();
          retval.push({
            time: time,
            temp: temp,
          });
        }
      }
    }

    return retval;
  }

  readTimeTimePointsPairs() {
    let retval = [];
    // 4 bytes for the length
    if (this.length >= this.readOffset + 4) {
      let points = this.readInt32LE();
      // 16 bytes per on time, 16 bytes per off time
      if (this.length >= this.readOffset + (points * (16 + 16))) {
        for (let i = 0; i < points; i++) {
          let onTime = this.readSLDateTime();
          let offTime = this.readSLDateTime();
          retval.push({
            on: onTime,
            off: offTime,
          });
        }
      }
    }

    return retval;
  }

  static getResponseId() {
    return MSG_ID + 1;
  }

  static getPayloadId() {
    return PAYLOAD_MSG_ID;
  }
};
