const SLMessage = require('./SLMessage.js').SLMessage;

exports.SLVersionMessage = class SLVersionMessage extends SLMessage {
  constructor(buf) {
    super(0, 8120);
    if (buf) {
      this._wroteSize = true;
      this.writeBuffer(buf, 0);

      this.decode();
    }
  }

  decode() {
    super.decode();

    this.version = this.readSLString();
  }
}
