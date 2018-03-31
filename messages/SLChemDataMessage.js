const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12592;

exports.SLChemDataMessage = class SLChemDataMessage extends SLMessage {
  constructor(buf) {
    super(0, MSG_ID);
    if (!buf) {
      this.writeInt32LE(0); // controller index
    } else {
      this._wroteSize = true;
      this.writeBuffer(buf, 0);

      this.decode();
    }
  }

  decode() {
    super.decode();

    this.isValid = false;

    let sentinel = this.readInt32LE();
    if (sentinel === 42) {
      this.isValid = true;
      this._readOffset++;
      this.pH = this.readUInt16BE() / 100;
      this.orp = this.readUInt16BE();
      this.pHSetPoint = this.readUInt16BE() / 100;
      this.orpSetPoint = this.readUInt16BE();
      this._readOffset += 12;
      this.pHTankLevel = this.readUInt8();
      this.orpTankLevel = this.readUInt8();
      this.saturation = this.readUInt8();
      if ((this.saturation & 128) !== 0) {
        this.saturation = -(256 - this.saturation);
      }
      this.saturation /= 100;
      this.calcium = this.readUInt16BE();
      this.cyanuricAcid = this.readUInt16BE();
      this.alkalinity = this.readUInt16BE();
      let salt = this.readUInt16LE();
      this.saltPPM = salt * 50;
      this.temperature = this.readUInt8();
      this._readOffset += 2;
      let balance = this.readUInt8();
      this.corrosive = (balance & 1) !== 0;
      this.scaling = (balance & 2) !== 0;
      this.error = (salt & 128) !== 0;
    }
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
}
