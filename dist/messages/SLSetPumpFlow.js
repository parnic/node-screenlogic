/* 'use strict';

import {SLMessage} from './SLMessage';

const MSG_ID = 12586;

export class SLSetPumpFlow extends SLMessage {
  pumpId: number;
  circuitId: any;
  setPoint: any;
  isRPMs: number;
  constructor(pumpId:Buffer|number, circuitId?, setPoint?, isRPMs?, senderId?) {
    if (typeof pumpId === 'object') {
      var size = pumpId.readInt32LE(4) + 8;
      super(pumpId, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.pumpId = pumpId;
      this.circuitId = circuitId;
      this.setPoint = setPoint;

      if (isRPMs === true) {
        this.isRPMs = 1;
      } else {
        this.isRPMs = 0;
      }
    }
  }


  encode() {
    this.writeInt32LE(0); // Always 0 in my case
    this.writeInt32LE(this.pumpId); // presumably pumpId, always 0 in my case
    this.writeInt32LE(this.circuitId); // This is indexed to the array of circuits returned in GetPumpStatus
    this.writeInt32LE(this.setPoint);
    this.writeInt32LE(this.isRPMs); // 0 for GPM, 1 for RPMs

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
 */ 
//# sourceMappingURL=SLSetPumpFlow.js.map