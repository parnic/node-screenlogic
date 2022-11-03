/*  'use strict';

import {SLMessage} from './SLMessage';

const _MSG_ID = 27;

export class SLSendLoginMessage extends SLMessage {
  static MSG_ID = _MSG_ID;
  constructor(password) {
    super();
    this.messageId = SLSendLoginMessage.MSG_ID;
    this.createEmpty();
    this.addHeader(this.senderId, this.messageId)
    this.writeInt32LE(348); // schema
    this.writeInt32LE(0); // connection type
    this.writeSLString('node-screenlogic'); // version

    if (!password) {
      password = new Array(16);
    }
    if (password.length > 16) {
      password = password.slice(0, 16);
    }
    this.writeSLArray(password); // encoded password. empty/unused for local connections

    this.writeInt32LE(2); // procID
  }
};
 */ 
//# sourceMappingURL=SLLoginMessage.js.map