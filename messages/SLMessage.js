'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.Outbound = exports.Inbound = exports.SLMessage = void 0;
// const SmartBuffer = require('smart-buffer').SmartBuffer;
var smart_buffer_1 = require("smart-buffer");
var DAY_VALUES = [
    ['Mon', 0x1],
    ['Tue', 0x2],
    ['Wed', 0x4],
    ['Thu', 0x8],
    ['Fri', 0x10],
    ['Sat', 0x20],
    ['Sun', 0x40],
];
var SLMessage = /** @class */ (function () {
    function SLMessage(controllerId, senderId) {
        this.senderId = 0;
        this.controllerId = 0;
        this.controllerId = controllerId;
        this.senderId = senderId;
    }
    Object.defineProperty(SLMessage.prototype, "readOffset", {
        get: function () { return this._smartBuffer.readOffset; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SLMessage.prototype, "length", {
        get: function () { return this._smartBuffer.length; },
        enumerable: false,
        configurable: true
    });
    SLMessage.slackForAlignment = function (val) {
        return (4 - val % 4) % 4;
    };
    SLMessage.prototype.getDayValue = function (dayName) {
        for (var i = 0; i < DAY_VALUES.length; i++) {
            if (DAY_VALUES[i][0] === dayName) {
                return DAY_VALUES[i][1];
            }
        }
        return 0;
    };
    return SLMessage;
}());
exports.SLMessage = SLMessage;
;
var Inbound = /** @class */ (function (_super) {
    __extends(Inbound, _super);
    function Inbound() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Inbound.prototype.readFromBuffer = function (buf) {
        this._smartBuffer = smart_buffer_1.SmartBuffer.fromBuffer(buf);
        this.decode();
    };
    Inbound.prototype.readMessage = function (buf) {
        this._wroteSize = true;
        this._smartBuffer.writeBuffer(buf, 0);
        this.decode();
    };
    Inbound.prototype.readSLString = function () {
        var len = this._smartBuffer.readInt32LE();
        var str = this._smartBuffer.readString(len);
        this._smartBuffer.readOffset += SLMessage.slackForAlignment(len);
        return str;
    };
    Inbound.prototype.readSLArray = function () {
        var len = this._smartBuffer.readInt32LE();
        var retval = new Array(len);
        for (var i = 0; i < len; i++) {
            retval[i] = this._smartBuffer.readUInt8();
        }
        this._smartBuffer.readOffset += SLMessage.slackForAlignment(len);
        return retval;
    };
    Inbound.prototype.decode = function () {
        this._smartBuffer.readOffset = 0;
        this.senderId = this._smartBuffer.readUInt16LE();
        this.messageId = this._smartBuffer.readUInt16LE();
        // this.messageId = this._smartBuffer.readInt16LE(2);
        this.dataLength = this._smartBuffer.readInt32LE();
    };
    Inbound.prototype.isBitSet = function (value, bit) {
        return ((value >> bit) & 0x1) === 1;
    };
    Inbound.prototype.decodeTime = function (rawTime) {
        var retVal;
        retVal = Math.floor(rawTime / 60) * 100 + rawTime % 60;
        retVal = String(retVal).padStart(4, '0');
        return retVal;
    };
    Inbound.prototype.decodeDayMask = function (dayMask) {
        var days = [];
        for (var i = 0; i < 7; i++) {
            if (this.isBitSet(dayMask, i)) {
                days.push(DAY_VALUES[i][0]);
            }
        }
        return days;
    };
    Inbound.prototype.readSLDateTime = function () {
        var year = this._smartBuffer.readInt16LE();
        var month = this._smartBuffer.readInt16LE() - 1;
        this._smartBuffer.readInt16LE(); // day of week
        var day = this._smartBuffer.readInt16LE();
        var hour = this._smartBuffer.readInt16LE();
        var minute = this._smartBuffer.readInt16LE();
        var second = this._smartBuffer.readInt16LE();
        var millisecond = this._smartBuffer.readInt16LE();
        var date = new Date(year, month, day, hour, minute, second, millisecond);
        return date;
    };
    Inbound.prototype.readUInt8 = function () {
        return this._smartBuffer.readUInt8();
    };
    Inbound.prototype.readUInt16BE = function () {
        return this._smartBuffer.readUInt16BE();
    };
    Inbound.prototype.readUInt16LE = function () {
        return this._smartBuffer.readUInt16LE();
    };
    Inbound.prototype.readInt32LE = function () {
        return this._smartBuffer.readInt32LE();
    };
    Inbound.prototype.readUInt32LE = function () {
        return this._smartBuffer.readUInt32LE();
    };
    Inbound.prototype.incrementReadOffset = function (val) {
        this._smartBuffer.readOffset = this._smartBuffer.readOffset + val;
    };
    return Inbound;
}(SLMessage));
exports.Inbound = Inbound;
var Outbound = /** @class */ (function (_super) {
    __extends(Outbound, _super);
    function Outbound() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Outbound.prototype.createBaseMessage = function () {
        this._smartBuffer = new smart_buffer_1.SmartBuffer();
        this.addHeader();
    };
    Outbound.prototype.addHeader = function () {
        this._smartBuffer.writeUInt16LE(this.senderId);
        this._smartBuffer.writeUInt16LE(this.messageId);
        this._wroteSize = false;
    };
    Outbound.prototype.encodeDayMask = function (daysArray) {
        var dayMask = 0;
        for (var i = 0; i < daysArray.length; i++) {
            dayMask += this.getDayValue(daysArray[i]);
        }
        return dayMask;
    };
    Outbound.prototype.writeSLDateTime = function (date) {
        this._smartBuffer.writeInt16LE(date.getFullYear());
        this._smartBuffer.writeInt16LE(date.getMonth() + 1);
        this._smartBuffer.writeInt16LE(date.getDay() + 1);
        this._smartBuffer.writeInt16LE(date.getDate());
        this._smartBuffer.writeInt16LE(date.getHours());
        this._smartBuffer.writeInt16LE(date.getMinutes());
        this._smartBuffer.writeInt16LE(date.getSeconds());
        this._smartBuffer.writeInt16LE(date.getMilliseconds());
    };
    Outbound.prototype.writeInt32LE = function (val) {
        this._smartBuffer.writeInt32LE(val);
    };
    Outbound.prototype.encode = function () { };
    Outbound.getResponseId = function () {
        return this.MSG_ID + 1;
    };
    Outbound.prototype.toBuffer = function () {
        this.encode();
        if (this._wroteSize === false) {
            this._smartBuffer.insertInt32LE(this._smartBuffer.length - 4, 4);
            this._wroteSize = true;
        }
        else {
            this._smartBuffer.writeInt32LE(this._smartBuffer.length - 8, 4);
        }
        return this._smartBuffer.toBuffer();
    };
    Outbound.prototype.writeSLString = function (str) {
        this._smartBuffer.writeInt32LE(str.length);
        this._smartBuffer.writeString(str);
        this.skipWrite(SLMessage.slackForAlignment(str.length));
    };
    Outbound.prototype.writeSLBuffer = function (buf) {
        this._smartBuffer.writeInt32LE(buf.length);
        this._smartBuffer.writeBuffer(buf);
    };
    Outbound.prototype.writeSLArray = function (arr) {
        this._smartBuffer.writeInt32LE(arr.length);
        for (var i = 0; i < arr.length; i++) {
            this._smartBuffer.writeUInt8(arr[i]);
        }
        this.skipWrite(SLMessage.slackForAlignment(arr.length));
    };
    Outbound.prototype.skipWrite = function (num) {
        if (num > 0) {
            this._smartBuffer.writeBuffer(Buffer.alloc(num));
        }
    };
    Outbound.prototype.encodeTime = function (stringTime) {
        return Number(stringTime.substr(0, 2) * 60) + Number(stringTime.substr(2, 2));
    };
    return Outbound;
}(SLMessage));
exports.Outbound = Outbound;
