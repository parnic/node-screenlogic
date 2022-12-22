'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Outbound = exports.Inbound = exports.SLMessage = void 0;
// const SmartBuffer = require('smart-buffer').SmartBuffer;
const smart_buffer_1 = require("smart-buffer");
const DAY_VALUES = [
    ['Mon', 0x1],
    ['Tue', 0x2],
    ['Wed', 0x4],
    ['Thu', 0x8],
    ['Fri', 0x10],
    ['Sat', 0x20],
    ['Sun', 0x40],
];
class SLMessage {
    constructor(controllerId, senderId) {
        this.senderId = 0;
        this.controllerId = 0;
        this.controllerId = controllerId;
        this.senderId = senderId;
    }
    get readOffset() { return this._smartBuffer.readOffset; }
    get length() { return this._smartBuffer.length; }
    static slackForAlignment(val) {
        return (4 - val % 4) % 4;
    }
    getDayValue(dayName) {
        for (var i = 0; i < DAY_VALUES.length; i++) {
            if (DAY_VALUES[i][0] === dayName) {
                return DAY_VALUES[i][1];
            }
        }
        return 0;
    }
    toBuffer() {
        return this._smartBuffer.toBuffer();
    }
}
exports.SLMessage = SLMessage;
;
class Inbound extends SLMessage {
    readFromBuffer(buf) {
        this._smartBuffer = smart_buffer_1.SmartBuffer.fromBuffer(buf);
        this.decode();
    }
    readMessage(buf) {
        this._wroteSize = true;
        this._smartBuffer.writeBuffer(buf, 0);
        this.decode();
    }
    readSLString() {
        var len = this._smartBuffer.readInt32LE();
        var str = this._smartBuffer.readString(len);
        this._smartBuffer.readOffset += SLMessage.slackForAlignment(len);
        return str;
    }
    readSLArray() {
        var len = this._smartBuffer.readInt32LE();
        var retval = new Array(len);
        for (var i = 0; i < len; i++) {
            retval[i] = this._smartBuffer.readUInt8();
        }
        this._smartBuffer.readOffset += SLMessage.slackForAlignment(len);
        return retval;
    }
    decode() {
        this._smartBuffer.readOffset = 0;
        this.senderId = this._smartBuffer.readUInt16LE();
        this.action = this._smartBuffer.readUInt16LE();
        // this.messageId = this._smartBuffer.readInt16LE(2);
        this.dataLength = this._smartBuffer.readInt32LE();
    }
    isBitSet(value, bit) {
        return ((value >> bit) & 0x1) === 1;
    }
    decodeTime(rawTime) {
        var retVal;
        retVal = Math.floor(rawTime / 60) * 100 + rawTime % 60;
        retVal = String(retVal).padStart(4, '0');
        return retVal;
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
    readSLDateTime() {
        let year = this._smartBuffer.readInt16LE();
        let month = this._smartBuffer.readInt16LE() - 1;
        this._smartBuffer.readInt16LE(); // day of week
        let day = this._smartBuffer.readInt16LE();
        let hour = this._smartBuffer.readInt16LE();
        let minute = this._smartBuffer.readInt16LE();
        let second = this._smartBuffer.readInt16LE();
        let millisecond = this._smartBuffer.readInt16LE();
        let date = new Date(year, month, day, hour, minute, second, millisecond);
        return date;
    }
    readUInt8() {
        return this._smartBuffer.readUInt8();
    }
    readUInt16BE() {
        return this._smartBuffer.readUInt16BE();
    }
    readUInt16LE() {
        return this._smartBuffer.readUInt16LE();
    }
    readInt32LE() {
        return this._smartBuffer.readInt32LE();
    }
    readUInt32LE() {
        return this._smartBuffer.readUInt32LE();
    }
    incrementReadOffset(val) {
        this._smartBuffer.readOffset = this._smartBuffer.readOffset + val;
    }
    toString() {
        return this._smartBuffer.toString();
    }
}
exports.Inbound = Inbound;
class Outbound extends SLMessage {
    createBaseMessage() {
        this._smartBuffer = new smart_buffer_1.SmartBuffer();
        this.addHeader();
    }
    addHeader() {
        this._smartBuffer.writeUInt16LE(this.senderId);
        this._smartBuffer.writeUInt16LE(this.action);
        this._wroteSize = false;
    }
    encodeDayMask(daysArray) {
        var dayMask = 0;
        for (var i = 0; i < daysArray.length; i++) {
            dayMask += this.getDayValue(daysArray[i]);
        }
        return dayMask;
    }
    writeSLDateTime(date) {
        this._smartBuffer.writeInt16LE(date.getFullYear());
        this._smartBuffer.writeInt16LE(date.getMonth() + 1);
        this._smartBuffer.writeInt16LE(date.getDay() + 1);
        this._smartBuffer.writeInt16LE(date.getDate());
        this._smartBuffer.writeInt16LE(date.getHours());
        this._smartBuffer.writeInt16LE(date.getMinutes());
        this._smartBuffer.writeInt16LE(date.getSeconds());
        this._smartBuffer.writeInt16LE(date.getMilliseconds());
    }
    writeInt32LE(val) {
        this._smartBuffer.writeInt32LE(val);
    }
    encode() { }
    static getResponseId() {
        return this.MSG_ID + 1;
    }
    toBuffer() {
        this.encode();
        if (this._wroteSize === false) {
            this._smartBuffer.insertInt32LE(this._smartBuffer.length - 4, 4);
            this._wroteSize = true;
        }
        else {
            this._smartBuffer.writeInt32LE(this._smartBuffer.length - 8, 4);
        }
        return this._smartBuffer.toBuffer();
    }
    writeSLString(str) {
        this._smartBuffer.writeInt32LE(str.length);
        this._smartBuffer.writeString(str);
        this.skipWrite(SLMessage.slackForAlignment(str.length));
    }
    writeSLBuffer(buf) {
        this._smartBuffer.writeInt32LE(buf.length);
        this._smartBuffer.writeBuffer(buf);
    }
    writeSLArray(arr) {
        this._smartBuffer.writeInt32LE(arr.length);
        for (var i = 0; i < arr.length; i++) {
            this._smartBuffer.writeUInt8(arr[i]);
        }
        this.skipWrite(SLMessage.slackForAlignment(arr.length));
    }
    skipWrite(num) {
        if (num > 0) {
            this._smartBuffer.writeBuffer(Buffer.alloc(num));
        }
    }
    encodeTime(stringTime) {
        return Number(stringTime.substr(0, 2) * 60) + Number(stringTime.substr(2, 2));
    }
}
exports.Outbound = Outbound;
//# sourceMappingURL=SLMessage.js.map