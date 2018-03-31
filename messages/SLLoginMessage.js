const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 27;

exports.SLLoginMessage = class SLLoginMessage extends SLMessage {
  constructor() {
    super(0, MSG_ID);
    this.writeInt32LE(348); // schema
    this.writeInt32LE(0); // connection type
    this.writeSLString('node-screenlogic'); // version
    this.writeSLBuffer(Buffer.alloc(16)); // encoded password. empty/unused for local connections
    this.writeInt32LE(2); // procID
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
}
