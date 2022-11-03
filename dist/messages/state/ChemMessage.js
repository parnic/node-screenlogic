"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChemMessage = void 0;
class ChemMessage {
    static decodeChemDataMessage(msg) {
        let isValid = false;
        let sentinel = msg.readInt32LE();
        if (sentinel === 42) {
            isValid = true;
            // msg._smartBuffer.readOffset++;
            msg.incrementReadOffset(1);
            let pH = msg.readUInt16BE() / 100;
            let orp = msg.readUInt16BE();
            let pHSetPoint = msg.readUInt16BE() / 100;
            let orpSetPoint = msg.readUInt16BE();
            // msg._smartBuffer.readOffset += 12;
            msg.incrementReadOffset(12);
            let pHTankLevel = msg.readUInt8();
            let orpTankLevel = msg.readUInt8();
            let saturation = msg.readUInt8();
            if ((saturation & 128) !== 0) {
                saturation = -(256 - saturation);
            }
            saturation /= 100;
            let calcium = msg.readUInt16BE();
            let cyanuricAcid = msg.readUInt16BE();
            let alkalinity = msg.readUInt16BE();
            let salt = msg.readUInt16LE();
            let saltPPM = salt * 50;
            let temperature = msg.readUInt8();
            msg.incrementReadOffset(2);
            let balance = msg.readUInt8();
            let corrosive = (balance & 1) !== 0;
            let scaling = (balance & 2) !== 0;
            let error = (salt & 128) !== 0;
            let data = {
                isValid,
                pH,
                orp,
                pHSetPoint,
                orpSetPoint,
                pHTankLevel,
                orpTankLevel,
                saturation,
                calcium,
                cyanuricAcid,
                alkalinity,
                saltPPM,
                temperature,
                balance,
                corrosive,
                scaling,
                error
            };
            return data;
        }
    }
    static decodecChemHistoryMessage(msg) {
        let readTimePHPointsPairs = () => {
            let retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                let points = msg.readInt32LE();
                // 16 bytes per time, 4 bytes per pH reading
                if (msg.length >= msg.readOffset + (points * (16 + 4))) {
                    for (let i = 0; i < points; i++) {
                        let time = msg.readSLDateTime();
                        let pH = msg.readInt32LE() / 100;
                        retval.push({
                            time: time,
                            pH: pH,
                        });
                    }
                }
            }
            return retval;
        };
        let readTimeORPPointsPairs = () => {
            let retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                let points = msg.readInt32LE();
                // 16 bytes per time, 4 bytes per ORP reading
                if (msg.length >= msg.readOffset + (points * (16 + 4))) {
                    for (let i = 0; i < points; i++) {
                        let time = msg.readSLDateTime();
                        let orp = msg.readInt32LE();
                        retval.push({
                            time: time,
                            orp: orp,
                        });
                    }
                }
            }
            return retval;
        };
        let readTimeTimePointsPairs = () => {
            let retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                let points = msg.readInt32LE();
                // 16 bytes per on time, 16 bytes per off time
                if (msg.length >= msg.readOffset + (points * (16 + 16))) {
                    for (let i = 0; i < points; i++) {
                        let onTime = msg.readSLDateTime();
                        let offTime = msg.readSLDateTime();
                        retval.push({
                            on: onTime,
                            off: offTime,
                        });
                    }
                }
            }
            return retval;
        };
        let data = {
            phPoints: readTimePHPointsPairs(),
            orpPoints: readTimeORPPointsPairs(),
            phRuns: readTimeTimePointsPairs(),
            orpRuns: readTimeTimePointsPairs()
        };
        return data;
    }
}
exports.ChemMessage = ChemMessage;
//# sourceMappingURL=ChemMessage.js.map