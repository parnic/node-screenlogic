'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12526;
const ASYNC_MSG_ID = 12500;

const SPA_CIRCUIT_ID = 500;
const POOL_CIRCUIT_ID = 505;

exports.SLPoolStatusMessage = class SLPoolStatusMessage extends SLMessage {
  constructor(buf, senderId) {
    if (buf) {
      var size = buf.readInt32LE(4) + 8;
      super(buf, MSG_ID, size);
    } else {
      super(senderId, MSG_ID);

      this.writeInt32LE(0);
    }
  }

  decode() {
    super.decode();

    this.ok = this.readInt32LE();
    this.freezeMode = this.readUInt8();
    this.remotes = this.readUInt8();
    this.poolDelay = this.readUInt8();
    this.spaDelay = this.readUInt8();
    this.cleanerDelay = this.readUInt8();
    this.readOffset += 3;
    this.airTemp = this.readInt32LE();

    let bodiesCount = this.readInt32LE();
    if (bodiesCount > 2) {
      bodiesCount = 2;
    }
    this.currentTemp = new Array(bodiesCount);
    this.heatStatus = new Array(bodiesCount);
    this.setPoint = new Array(bodiesCount);
    this.coolSetPoint = new Array(bodiesCount);
    this.heatMode = new Array(bodiesCount);
    for (let i = 0; i < bodiesCount; i++) {
      let bodyType = this.readInt32LE();
      if (bodyType < 0 || bodyType >= 2) {
        bodyType = 0;
      }
      this.currentTemp[bodyType] = this.readInt32LE();
      this.heatStatus[bodyType] = this.readInt32LE();
      this.setPoint[bodyType] = this.readInt32LE();
      this.coolSetPoint[bodyType] = this.readInt32LE();
      this.heatMode[bodyType] = this.readInt32LE();
    }

    let circuitCount = this.readInt32LE();
    this.circuitArray = new Array(circuitCount);
    for (let i = 0; i < circuitCount; i++) {
      this.circuitArray[i] = {
        id: this.readInt32LE(),
        state: this.readInt32LE(),
        colorSet: this.readUInt8(),
        colorPos: this.readUInt8(),
        colorStagger: this.readUInt8(),
        delay: this.readUInt8(),
      };
    }

    this.pH = this.readInt32LE() / 100;
    this.orp = this.readInt32LE();
    this.saturation = this.readInt32LE() / 100;
    this.saltPPM = this.readInt32LE() * 50;
    this.pHTank = this.readInt32LE();
    this.orpTank = this.readInt32LE();
    this.alarms = this.readInt32LE();
  }

  isDeviceReady() {
    return this.ok === 1;
  }

  isDeviceSync() {
    return this.ok === 2;
  }

  isDeviceServiceMode() {
    return this.ok === 3;
  }

  circuitData(id) {
    for (let i = 0; i < this.circuitArray.length; i++) {
      if (this.circuitArray[i].id === id) {
        return this.circuitArray[i];
      }
    }
    return undefined;
  }

  isSpaActive() {
    return this.circuitData(SPA_CIRCUIT_ID).state === 1;
  }

  isPoolActive() {
    return this.circuitData(POOL_CIRCUIT_ID).state === 1;
  }

  static getResponseId() {
    return MSG_ID + 1;
  }

  static getAsyncResponseId() {
    return ASYNC_MSG_ID;
  }
};
