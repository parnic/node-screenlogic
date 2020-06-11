'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 12566;

exports.SLEquipmentConfigurationMessage = class SLEquipmentConfigurationMessage extends SLMessage {
  constructor(buf) {
    var size;
    if (buf) {
      size = buf.readInt32LE(4) + 8;
    }
    super(0, MSG_ID, size);

    if (!buf) {
      this.writeInt32LE(0);
      this.writeInt32LE(0);
    } else {
      this._wroteSize = true;
      this.writeBuffer(buf, 0);

      this.decode();
    }
  }

  decode() {
    super.decode();

    this.controllerType = this.readUInt8();
    this.hardwareType = this.readUInt8();
    this.readUInt8();
    this.readUInt8();
    this.controllerData = this.readInt32LE();
    this.versionDataArray = this.readSLArray();
    this.speedDataArray = this.readSLArray();
    this.valveDataArray = this.readSLArray();
    this.remoteDataArray = this.readSLArray();
    this.sensorDataArray = this.readSLArray();
    this.delayDataArray = this.readSLArray();
    this.macroDataArray = this.readSLArray();
    this.miscDataArray = this.readSLArray();
    this.lightDataArray = this.readSLArray();
    this.flowDataArray = this.readSLArray();
    this.sgDataArray = this.readSLArray();
    this.spaFlowDataArray = this.readSLArray();
  }

  getVersion() {
    if (this.versionDataArray === null || this.versionDataArray.length < 2) {
      return 0;
    }

    return (this.versionDataArray[0] * 1000) + (this.versionDataArray[1]);
  }

  getSecondariesCount() {
    return (this.controllerData & 0x11000000) >> 6;
  }

  getPumpType(pumpIndex) {
    if (typeof (pumpIndex) !== 'number') {
      return 0;
    }

    if (this.flowDataArray === null || this.flowDataArray.length < (pumpIndex + 1) * 45) {
      return 0;
    }

    let pumpType = this.flowDataArray[(45 * pumpIndex) + 2];
    if (pumpType <= 3) {
      return pumpType;
    }

    return 0;
  }

  getCircuitRPMs(pumpIndex, circuitDeviceId) {
    if (typeof (pumpIndex) !== 'number' || typeof (circuitDeviceId) !== 'number') {
      return 0;
    }

    if (pumpIndex < 0 || pumpIndex >= 8) {
      return 0;
    }

    if (this.flowDataArray === null || this.flowDataArray.length < (pumpIndex + 1) * 45) {
      return 0;
    }

    for (var i = 0; i < 8; i++) {
      let offset = (45 * pumpIndex) + 4 + (i * 2);
      if (this.flowDataArray[offset] === circuitDeviceId) {
        let upperBits = this.flowDataArray[offset + 1];
        let lowerBits = this.flowDataArray[offset + (16 - (i * 2)) + 1 + i];
        return (upperBits << 8) + lowerBits;
      }
    }

    return 0;
  }

  getNumPumps() {
    if (this.flowDataArray === null) {
      return 0;
    }

    let numPumps = 0;
    for (var i = 0; i < this.flowDataArray.length; i += 45) {
      if (this.flowDataArray[i + 2] !== 0) {
        numPumps++;
      }
    }

    return numPumps;
  }

  static getResponseId() {
    return MSG_ID + 1;
  }

  decodeValveData() {
    var slaves = this.getSecondariesCount();
    var bEnable1 = true;
    var bEnable2 = true;

    var sensor1 = this.sensorDataArray[0];
    var sensor3 = this.sensorDataArray[2];
    var bSolar1 = ((sensor1 >> 1) & 0x1) !== 0;
    var bHPump1 = ((sensor3 >> 4) & 0x1) !== 0;

    if (bSolar1 && !bHPump1) {
      bEnable1 = false;
    }

    if (this.isDualBody()) {
      var bSolar2 = ((sensor1 >> 4) & 0x1) !== 0;
      var bHPump2 = ((sensor3 >> 5) & 0x1) !== 0;

      if (bSolar2 && !bHPump2) {
        bEnable2 = false;
      }
    }

    var valveArray = [];

    for (var loadCenterIndex = 0; loadCenterIndex <= slaves; loadCenterIndex++) {
      var byByte = this.valveDataArray[loadCenterIndex];
      var valveIndex = 0;
      var valveObject = {};

      while (valveIndex < 5) {
        var bEnable = true;
        if (loadCenterIndex === 0) {
          if (valveIndex === 0 && !bEnable1) {
            bEnable = false;
          }
          if (valveIndex === 1 && !bEnable2) {
            bEnable = false;
          }
        }
        var bPresent = valveIndex < 2 ? true : (byByte & (1 << valveIndex)) !== 0;
        if (bPresent) {
          var valveDataIndex = (loadCenterIndex * 5) + 4 + valveIndex;
          var deviceId = this.valveDataArray[valveDataIndex];
          if (deviceId === 0) {
            // console.log('unused valve, loadCenterIndex = ' + loadCenterIndex + ' valveIndex = ' + valveIndex);
          } else if (bEnable === false){
            // console.log('used by solar');
          } else {
            valveObject.loadCenterIndex = loadCenterIndex;
            valveObject.valveIndex = valveIndex;
            valveObject.valveName = String.fromCharCode(65 + valveIndex);
            valveObject.loadCenterName = (loadCenterIndex + 1).toString();
            valveObject.deviceId = deviceId;
            valveArray.push(valveObject);
          }
        }

        valveIndex++;
      }

    }
    console.log(valveArray);

  }

  isDualBody() {
    return this.controllerType === 5;
  }
};
