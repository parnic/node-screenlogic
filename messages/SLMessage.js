'use strict';

const SmartBuffer = require('smart-buffer').SmartBuffer;

exports.SLMessage = class SLMessage extends SmartBuffer {
  constructor(senderId, messageId) {
    super();
    this.writeUInt16LE(senderId);
    this.writeUInt16LE(messageId);

    this._wroteSize = false;
  }

  toBuffer() {
    this.encode();

    if (this._wroteSize === false) {
      this.insertInt32LE(this.length - 4, 4);
      this._wroteSize = true;
    } else {
      this.writeInt32LE(this.length - 8, 4);
    }

    return super.toBuffer();
  }

  writeSLString(str) {
    this.writeInt32LE(str.length);
    this.writeString(str);
    this.skipWrite(SLMessage.slackForAlignment(str.length));
  }

  readSLString() {
    var len = this.readInt32LE();
    var str = this.readString(len);
    this.readOffset += SLMessage.slackForAlignment(len);
    return str;
  }

  writeSLBuffer(buf) {
    this.writeInt32LE(buf.length);
    this.writeBuffer(buf);
  }

  writeSLArray(arr) {
    this.writeInt32LE(arr.length);

    for (var i = 0; i < arr.length; i++) {
      this.writeUInt8(arr[i]);
    }

    this.skipWrite(SLMessage.slackForAlignment(arr.length));
  }

  skipWrite(num) {
    if (num > 0) {
      this.writeBuffer(Buffer.alloc(num));
    }
  }

  decode() {
    this.readOffset = 0;
    this.senderId = this.readUInt16LE();
    this.messageId = this.readUInt16LE();
    this.dataLength = this.readInt32LE();
  }

  static slackForAlignment(val) {
    return (4 - val % 4) % 4;
  }

  encode() {}
};
