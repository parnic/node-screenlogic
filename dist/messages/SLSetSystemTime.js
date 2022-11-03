/* 'use strict';

import {SLMessage} from './SLMessage';

const MSG_ID = 8112;

export class SLSetSystemTime extends SLMessage {
  date: any;
  shouldAdjustForDST: any;
  constructor(buf:Buffer, date?, shouldAdjustForDST?, senderId?) {
    if (buf) {
      var size = buf.readInt32LE(4) + 8;
      super(buf, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.date = date;
      this.shouldAdjustForDST = shouldAdjustForDST;
    }
  }

  encode() {
    this.writeSLDateTime(this.date);
    this.writeInt32LE(this.shouldAdjustForDST ? 1 : 0);
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
 */ 
//# sourceMappingURL=SLSetSystemTime.js.map