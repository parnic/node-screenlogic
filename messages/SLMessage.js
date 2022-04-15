'use strict';

const SmartBuffer = require('smart-buffer').SmartBuffer;

const DAY_VALUES = [
  ['Mon', 0x1 ],
  ['Tue', 0x2 ],
  ['Wed', 0x4 ],
  ['Thu', 0x8 ],
  ['Fri', 0x10 ],
  ['Sat', 0x20 ],
  ['Sun', 0x40 ],
];

exports.SLMessage = class SLMessage extends SmartBuffer {
  constructor(senderId, messageId, size) {
    var options;
    if (size) {
      options = {
        size: size,
      };
    }
    super(options);

    if (typeof senderId === 'number' || typeof senderId === 'undefined') {
      this.writeUInt16LE(senderId || 0);
      this.writeUInt16LE(messageId || 0);

      this._wroteSize = false;
    } else if (typeof senderId === 'object') {
      this._wroteSize = true;
      var buffer = senderId;
      this.writeBuffer(buffer, 0);

      this.decode();
    }
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

  readSLArray() {
    var len = this.readInt32LE();

    var retval = new Array(len);
    for (var i = 0; i < len; i++) {
      retval[i] = this.readUInt8();
    }

    this.readOffset += SLMessage.slackForAlignment(len);

    return retval;
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

  isBitSet(value, bit) {
    return ((value >> bit) & 0x1) === 1;
  }

  decodeTime(rawTime) { // Takes 'rawTime' in mins past midnight and returns military time as a string
    var retVal;

    retVal = Math.floor(rawTime / 60) * 100 + rawTime % 60;

    retVal = String(retVal).padStart(4, '0');

    return retVal;
  }

  encodeTime(stringTime) { // Takes 'stringTime' as military time and returns mins past midnight
    return Number(stringTime.substr(0, 2) * 60) + Number(stringTime.substr(2, 2));
  }

  decodeDayMask(dayMask) {
    var days = [];

    for (var i = 0; i < 7; i++) {
      if (this.isBitSet(dayMask, i)) {
        days.push(DAY_VALUES[i][0]);
      }
    }
    return days;
  }

  encodeDayMask(daysArray) {
    var dayMask = 0;

    for (var i = 0; i < daysArray.length; i++) {
      dayMask += this.getDayValue(daysArray[i]);
    }
    return dayMask;
  }

  getDayValue(dayName) {
    for (var i = 0; i < DAY_VALUES.length; i++) {
      if (DAY_VALUES[i][0] === dayName) {
        return DAY_VALUES[i][1];
      }
    }
    return 0;
  }

  writeSLDateTime(date) {
    this.writeInt16LE(date.getFullYear());
    this.writeInt16LE(date.getMonth() + 1);
    var dayOfWeek = date.getDay() + 1;
    if (dayOfWeek == 7) {
      dayOfWeek = 0;
    }
    this.writeInt16LE(dayOfWeek);
    this.writeInt16LE(date.getDate());
    this.writeInt16LE(date.getHours());
    this.writeInt16LE(date.getMinutes());
    this.writeInt16LE(date.getSeconds());
    this.writeInt16LE(date.getMilliseconds());
  }

  readSLDateTime() {
    let date = new Date();
    date.setFullYear(this.readInt16LE());
    date.setMonth(this.readInt16LE() - 1);
    this.readInt16LE();
    date.setDate(this.readInt16LE());
    date.setHours(this.readInt16LE());
    date.setMinutes(this.readInt16LE());
    date.setSeconds(this.readInt16LE());
    date.setMilliseconds(this.readInt16LE());

    return date;
  }

  static slackForAlignment(val) {
    return (4 - val % 4) % 4;
  }

  encode() {}
};
