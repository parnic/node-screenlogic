/* 'use strict';

import {SLMessage} from './SLMessage';

const MSG_ID = 12550;


export class SLSetCircuitRuntimeById extends SLMessage {
  circuitId: number;
  runTime: any;
  constructor(circuitId:Buffer|number, runTime?, senderId?) {
    if (typeof circuitId === 'object') {
      var size = circuitId.readInt32LE(4) + 8;
      super(circuitId, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.circuitId = circuitId;
      this.runTime = runTime;
    }
  }

  encode() {
    this.writeInt32LE(0);
    this.writeInt32LE(this.circuitId);
    this.writeInt32LE(this.runTime);

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
 */ 
//# sourceMappingURL=SLSetCircuitRuntimeById.js.map