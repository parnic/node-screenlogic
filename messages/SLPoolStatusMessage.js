const SLMessage = require('./SLMessage.js').SLMessage;

exports.SLPoolStatusMessage = class SLPoolStatusMessage extends SLMessage {
  constructor(buf) {
    super(0, 12526);
    if (!buf) {
      this.writeInt32LE(0);
    } else {
      this._wroteSize = true;
      this.writeBuffer(buf, 0);

      this.decode();
    }
  }

  decode() {
    super.decode();

    this.ok = this.readInt32LE();
    this.freezeMode = this.readUInt8();
    this.remotes = this.readUInt8();
    this.poolDelay = this.readUInt8();
    this.spaDelay = this.readUInt8();
    this.cleanerDelay = this.readUInt8();
    this.readOffset += 3;
    this.airTemp = this.readInt32LE();

    let bodiesCount = this.readInt32LE();
    if (bodiesCount > 2) {
      bodiesCount = 2;
    }
    this.currentTemp = new Array(bodiesCount);
    this.heatStatus = new Array(bodiesCount);
    this.setPoint = new Array(bodiesCount);
    this.coolSetPoint = new Array(bodiesCount);
    this.heatMode = new Array(bodiesCount);
    for (let i = 0; i < bodiesCount; i++) {
      let bodyType = this.readInt32LE();
      if (bodyType < 0 || bodyType >= 2) {
        bodyType = 0;
      }
      this.currentTemp[bodyType] = this.readInt32LE();
      this.heatStatus[bodyType] = this.readInt32LE();
      this.setPoint[bodyType] = this.readInt32LE();
      this.coolSetPoint[bodyType] = this.readInt32LE();
      this.heatMode[bodyType] = this.readInt32LE();
    }

    let circuitCount = this.readInt32LE();
    this.circuitArray = new Array(circuitCount);
    for (let i = 0; i < circuitCount; i++) {
      this.circuitArray[i] = {
        id: this.readInt32LE(),
        state: this.readInt32LE(),
        colorSet: this.readUInt8(),
        colorPos: this.readUInt8(),
        colorStagger: this.readUInt8(),
        delay: this.readUInt8()
      }
    }

    this.pH = this.readInt32LE();
    this.orp = this.readInt32LE();
    this.saturation = this.readInt32LE();
    this.saltPPM = this.readInt32LE();
    this.pHTank = this.readInt32LE();
    this.orpTank = this.readInt32LE();
    this.alarms = this.readInt32LE();
  }
}
