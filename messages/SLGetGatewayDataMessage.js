'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 18003;

exports.SLGetGatewayDataMessage = class SLGetGatewayDataMessage extends SLMessage {
  constructor(buf) {
    var size;
    if (buf && typeof buf === 'object') {
      size = buf.readInt32LE(4) + 8;
    }
    super(0, MSG_ID, size);

    if (typeof buf === 'string') {
      this.writeSLString(buf);
      this.writeSLString(buf);
    } else if (buf) {
      this._wroteSize = true;
      this.writeBuffer(buf, 0);

      this.decode();
    }
  }

  decode() {
    super.decode();

    this.gatewayFound = this.readUInt8() !== 0;
    this.licenseOK = this.readUInt8() !== 0;
    this.ipAddr = this.readSLString();
    this.port = this.readUInt16LE();
    this.portOpen = this.readUInt8() !== 0;
    this.relayOn = this.readUInt8() !== 0;
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
