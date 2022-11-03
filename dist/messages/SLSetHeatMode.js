/* 'use strict';

import {SLMessage} from './SLMessage';

const MSG_ID = 12538;

export class SLSetHeatModeMessage extends SLMessage {
  controllerIndex: number;
  bodyType: any;
  heatMode: any;
  constructor(controllerIndex:Buffer|number, bodyType?, heatMode?, senderId?) {
    if (typeof controllerIndex === 'object') {
      var size = controllerIndex.readInt32LE(4) + 8;
      super(controllerIndex, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.controllerIndex = controllerIndex;
      this.bodyType = bodyType;
      this.heatMode = heatMode;
    }
  }

  encode() {
    this.writeInt32LE(this.controllerIndex || 0);
    this.writeInt32LE(this.bodyType || 0);
    this.writeInt32LE(this.heatMode || 0);

    super.encode();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
 */ 
//# sourceMappingURL=SLSetHeatMode.js.map