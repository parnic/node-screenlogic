"use strict";
exports.__esModule = true;
exports.ChemMessage = void 0;
var ChemMessage = /** @class */ (function () {
    function ChemMessage() {
    }
    ChemMessage.decodeChemDataMessage = function (msg) {
        var isValid = false;
        var sentinel = msg.readInt32LE();
        if (sentinel === 42) {
            isValid = true;
            // msg._smartBuffer.readOffset++;
            msg.incrementReadOffset(1);
            var pH = msg.readUInt16BE() / 100;
            var orp = msg.readUInt16BE();
            var pHSetPoint = msg.readUInt16BE() / 100;
            var orpSetPoint = msg.readUInt16BE();
            // msg._smartBuffer.readOffset += 12;
            msg.incrementReadOffset(12);
            var pHTankLevel = msg.readUInt8();
            var orpTankLevel = msg.readUInt8();
            var saturation = msg.readUInt8();
            if ((saturation & 128) !== 0) {
                saturation = -(256 - saturation);
            }
            saturation /= 100;
            var calcium = msg.readUInt16BE();
            var cyanuricAcid = msg.readUInt16BE();
            var alkalinity = msg.readUInt16BE();
            var salt = msg.readUInt16LE();
            var saltPPM = salt * 50;
            var temperature = msg.readUInt8();
            msg.incrementReadOffset(2);
            var balance = msg.readUInt8();
            var corrosive = (balance & 1) !== 0;
            var scaling = (balance & 2) !== 0;
            var error = (salt & 128) !== 0;
            var data = {
                isValid: isValid,
                pH: pH,
                orp: orp,
                pHSetPoint: pHSetPoint,
                orpSetPoint: orpSetPoint,
                pHTankLevel: pHTankLevel,
                orpTankLevel: orpTankLevel,
                saturation: saturation,
                calcium: calcium,
                cyanuricAcid: cyanuricAcid,
                alkalinity: alkalinity,
                saltPPM: saltPPM,
                temperature: temperature,
                balance: balance,
                corrosive: corrosive,
                scaling: scaling,
                error: error
            };
            return data;
        }
    };
    ChemMessage.decodecChemHistoryMessage = function (msg) {
        var readTimePHPointsPairs = function () {
            var retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                var points = msg.readInt32LE();
                // 16 bytes per time, 4 bytes per pH reading
                if (msg.length >= msg.readOffset + (points * (16 + 4))) {
                    for (var i = 0; i < points; i++) {
                        var time = msg.readSLDateTime();
                        var pH = msg.readInt32LE() / 100;
                        retval.push({
                            time: time,
                            pH: pH
                        });
                    }
                }
            }
            return retval;
        };
        var readTimeORPPointsPairs = function () {
            var retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                var points = msg.readInt32LE();
                // 16 bytes per time, 4 bytes per ORP reading
                if (msg.length >= msg.readOffset + (points * (16 + 4))) {
                    for (var i = 0; i < points; i++) {
                        var time = msg.readSLDateTime();
                        var orp = msg.readInt32LE();
                        retval.push({
                            time: time,
                            orp: orp
                        });
                    }
                }
            }
            return retval;
        };
        var readTimeTimePointsPairs = function () {
            var retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                var points = msg.readInt32LE();
                // 16 bytes per on time, 16 bytes per off time
                if (msg.length >= msg.readOffset + (points * (16 + 16))) {
                    for (var i = 0; i < points; i++) {
                        var onTime = msg.readSLDateTime();
                        var offTime = msg.readSLDateTime();
                        retval.push({
                            on: onTime,
                            off: offTime
                        });
                    }
                }
            }
            return retval;
        };
        var data = {
            phPoints: readTimePHPointsPairs(),
            orpPoints: readTimeORPPointsPairs(),
            phRuns: readTimeTimePointsPairs(),
            orpRuns: readTimeTimePointsPairs()
        };
        return data;
    };
    return ChemMessage;
}());
exports.ChemMessage = ChemMessage;
