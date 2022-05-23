'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 9807;

exports.SLGetWeatherForecast = class SLGetWeatherForecast extends SLMessage {
  constructor(buf, senderId) {
    if (buf) {
      var size = buf.readInt32LE(4) + 8;
      super(buf, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);
    }
  }

  decode() {
    super.decode();

    this.version = this.readInt32LE();
    this.zip = this.readSLString();
    this.lastUpdate = this.readSLDateTime();
    this.lastRequest = this.readSLDateTime();
    this.dateText = this.readSLString();
    this.text = this.readSLString();
    this.currentTemperature = this.readInt32LE();
    this.humidity = this.readInt32LE();
    this.wind = this.readSLString();
    this.pressure = this.readInt32LE();
    this.dewPoint = this.readInt32LE();
    this.windChill = this.readInt32LE();
    this.visibility = this.readInt32LE();

    let numDays = this.readInt32LE();
    this.dayData = new Array(numDays);
    for (let i = 0; i < numDays; i++) {
      let dayTime = this.readSLDateTime();
      let highTemp = this.readInt32LE();
      let lowTemp = this.readInt32LE();
      let text = this.readSLString();
      this.dayData[i] = {
        dayTime: dayTime,
        highTemperature: highTemp,
        lowTemperature: lowTemp,
        text: text,
      };
    }

    this.sunrise = this.readInt32LE();
    this.sunset = this.readInt32LE();
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
