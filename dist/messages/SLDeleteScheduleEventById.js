/* 'use strict';

import {SLMessage} from './SLMessage';

const MSG_ID = 12546;

export class SLDeleteScheduleEventById extends SLMessage {
  constructor(scheduleId?, senderId?) {
    super(senderId, MSG_ID);

    this.writeInt32LE(0);
    this.writeInt32LE(scheduleId);
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
 */ 
//# sourceMappingURL=SLDeleteScheduleEventById.js.map