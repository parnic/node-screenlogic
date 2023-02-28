"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChemMessage = void 0;
class ChemMessage {
    static decodeChemDataMessage(msg) {
        let isValid = false;
        const sentinel = msg.readInt32LE();
        if (sentinel === 42) {
            isValid = true;
            // msg._smartBuffer.readOffset++;
            msg.incrementReadOffset(1);
            const pH = msg.readUInt16BE() / 100;
            const orp = msg.readUInt16BE();
            const pHSetPoint = msg.readUInt16BE() / 100;
            const orpSetPoint = msg.readUInt16BE();
            // msg._smartBuffer.readOffset += 12;
            msg.incrementReadOffset(12);
            const pHTankLevel = msg.readUInt8();
            const orpTankLevel = msg.readUInt8();
            let saturation = msg.readUInt8();
            if ((saturation & 128) !== 0) {
                saturation = -(256 - saturation);
            }
            saturation /= 100;
            const calcium = msg.readUInt16BE();
            const cyanuricAcid = msg.readUInt16BE();
            const alkalinity = msg.readUInt16BE();
            const salt = msg.readUInt16LE();
            const saltPPM = salt * 50;
            const temperature = msg.readUInt8();
            msg.incrementReadOffset(2);
            const balance = msg.readUInt8();
            const corrosive = (balance & 1) !== 0;
            const scaling = (balance & 2) !== 0;
            const error = (salt & 128) !== 0;
            const data = {
                senderId: msg.senderId,
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
        const readTimePHPointsPairs = () => {
            const retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                const points = msg.readInt32LE();
                // 16 bytes per time, 4 bytes per pH reading
                if (msg.length >= msg.readOffset + (points * (16 + 4))) {
                    for (let i = 0; i < points; i++) {
                        const time = msg.readSLDateTime();
                        const pH = msg.readInt32LE() / 100;
                        retval.push({
                            time: time,
                            pH: pH,
                        });
                    }
                }
            }
            return retval;
        };
        const readTimeORPPointsPairs = () => {
            const retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                const points = msg.readInt32LE();
                // 16 bytes per time, 4 bytes per ORP reading
                if (msg.length >= msg.readOffset + (points * (16 + 4))) {
                    for (let i = 0; i < points; i++) {
                        const time = msg.readSLDateTime();
                        const orp = msg.readInt32LE();
                        retval.push({
                            time: time,
                            orp: orp,
                        });
                    }
                }
            }
            return retval;
        };
        const readTimeTimePointsPairs = () => {
            const retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                const points = msg.readInt32LE();
                // 16 bytes per on time, 16 bytes per off time
                if (msg.length >= msg.readOffset + (points * (16 + 16))) {
                    for (let i = 0; i < points; i++) {
                        const onTime = msg.readSLDateTime();
                        const offTime = msg.readSLDateTime();
                        retval.push({
                            on: onTime,
                            off: offTime,
                        });
                    }
                }
            }
            return retval;
        };
        const data = {
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