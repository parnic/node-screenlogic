/* 'use strict';

import {SLMessage} from './SLMessage';

const MSG_ID = 12596;
const PAYLOAD_MSG_ID = 12506;

export class SLGetChemHistoryData extends SLMessage {
  phPoints: any[];
  orpPoints: any[];
  phRuns: any[];
  orpRuns: any[];
  constructor(buf:Buffer, fromTime?, toTime?, senderId?) {
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

    this.phPoints = this.readTimePHPointsPairs();
    this.orpPoints = this.readTimeORPPointsPairs();
    this.phRuns = this.readTimeTimePointsPairs();
    this.orpRuns = this.readTimeTimePointsPairs();
  }

  readTimePHPointsPairs() {
    let retval = [];
    // 4 bytes for the length
    if (this.length >= this.readOffset + 4) {
      let points = this.readInt32LE();
      // 16 bytes per time, 4 bytes per pH reading
      if (this.length >= this.readOffset + (points * (16 + 4))) {
        for (let i = 0; i < points; i++) {
          let time = this.readSLDateTime();
          let pH = this.readInt32LE() / 100;
          retval.push({
            time: time,
            pH: pH,
          });
        }
      }
    }

    return retval;
  }

  readTimeORPPointsPairs() {
    let retval = [];
    // 4 bytes for the length
    if (this.length >= this.readOffset + 4) {
      let points = this.readInt32LE();
      // 16 bytes per time, 4 bytes per ORP reading
      if (this.length >= this.readOffset + (points * (16 + 4))) {
        for (let i = 0; i < points; i++) {
          let time = this.readSLDateTime();
          let orp = this.readInt32LE();
          retval.push({
            time: time,
            orp: orp,
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
 */ 
//# sourceMappingURL=SLGetChemHistoryData.js.map