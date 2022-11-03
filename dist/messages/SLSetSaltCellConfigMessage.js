/* 'use strict';

import {SLMessage} from './SLMessage';

const MSG_ID = 12576;

export class SLSetSaltCellConfigMessage extends SLMessage {
  controllerIndex: number;
  poolOutput: any;
  spaOutput: any;
  constructor(controllerIndex:Buffer|number, poolOutput?, spaOutput?, senderId?) {
    if (typeof controllerIndex === 'object') {
      var size = controllerIndex.readInt32LE(4) + 8;
      super(controllerIndex, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.controllerIndex = controllerIndex;
      this.poolOutput = poolOutput;
      this.spaOutput = spaOutput;
    }
  }

  encode() {
    this.writeInt32LE(this.controllerIndex || 0);
    this.writeInt32LE(this.poolOutput || 0);
    this.writeInt32LE(this.spaOutput || 0);
    this.writeInt32LE(0);
    this.writeInt32LE(0);

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
 */ 
//# sourceMappingURL=SLSetSaltCellConfigMessage.js.map