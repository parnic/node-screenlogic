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
exports.SLReceiveGatewayDataMessage = void 0;
var SLMessage_1 = require("./SLMessage");
var _MSG_ID = 18003;
var SLReceiveGatewayDataMessage = /** @class */ (function (_super) {
    __extends(SLReceiveGatewayDataMessage, _super);
    function SLReceiveGatewayDataMessage(buf) {
        var _this = _super.call(this, 0, 0) || this;
        _this.readFromBuffer(buf);
        _this.decode();
        return _this;
    }
    SLReceiveGatewayDataMessage.prototype.decode = function () {
        _super.prototype.decode.call(this);
        var gatewayFound = this._smartBuffer.readUInt8() !== 0;
        var licenseOK = this._smartBuffer.readUInt8() !== 0;
        var ipAddr = this.readSLString();
        var port = this._smartBuffer.readUInt16LE();
        var portOpen = this._smartBuffer.readUInt8() !== 0;
        var relayOn = this._smartBuffer.readUInt8() !== 0;
        this.data = {
            gatewayFound: gatewayFound,
            licenseOK: licenseOK,
            ipAddr: ipAddr,
            port: port,
            portOpen: portOpen,
            relayOn: relayOn
        };
    };
    SLReceiveGatewayDataMessage.prototype.get = function () {
        return this.data;
    };
    return SLReceiveGatewayDataMessage;
}(SLMessage_1.Inbound));
exports.SLReceiveGatewayDataMessage = SLReceiveGatewayDataMessage;
;
