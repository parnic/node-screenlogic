'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendGetWeatherForecast = exports.SLReceiveGetWeatherForecast = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 9807;
class SLReceiveGetWeatherForecast extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(buf) {
        super();
        this.messageId = _MSG_ID;
        this.createFromBuffer(buf);
        this.decode();
    }
    data;
    decode() {
        super.decode();
        let version = this.readInt32LE();
        let zip = this.readSLString();
        let lastUpdate = this.readSLDateTime();
        let lastRequest = this.readSLDateTime();
        let dateText = this.readSLString();
        let text = this.readSLString();
        let currentTemperature = this.readInt32LE();
        let humidity = this.readInt32LE();
        let wind = this.readSLString();
        let pressure = this.readInt32LE();
        let dewPoint = this.readInt32LE();
        let windChill = this.readInt32LE();
        let visibility = this.readInt32LE();
        let numDays = this.readInt32LE();
        let dayData = new Array(numDays);
        for (let i = 0; i < numDays; i++) {
            dayData[i] = {
                dayTime: this.readSLDateTime(),
                highTemp: this.readInt32LE(),
                lowTemp: this.readInt32LE(),
                text: this.readSLString(),
            };
        }
        let sunrise = this.readInt32LE();
        let sunset = this.readInt32LE();
        this.data = {
            version,
            zip,
            lastUpdate,
            lastRequest,
            dateText,
            text,
            currentTemperature,
            humidity,
            wind,
            pressure,
            dewPoint,
            windChill,
            visibility,
            dayData,
            sunrise,
            sunset
        };
    }
    get() {
        return this.data;
    }
}
exports.SLReceiveGetWeatherForecast = SLReceiveGetWeatherForecast;
;
class SLSendGetWeatherForecast extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(scheduleType, senderId) {
        super();
        this.messageId = _MSG_ID;
        this.createBaseMessage();
        //     this.addHeader(senderId, this.messageId);
    }
}
exports.SLSendGetWeatherForecast = SLSendGetWeatherForecast;
;
//# sourceMappingURL=SLGetWeatherForecast.js.map