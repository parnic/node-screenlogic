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
    this.valveDataArray = this.readSLArray(); // decodeValveData()
    this.remoteDataArray = this.readSLArray();
    this.sensorDataArray = this.readSLArray(); // decodeSensorData()
    this.delayDataArray = this.readSLArray(); // decodeDelayData()
    this.macroDataArray = this.readSLArray();
    this.miscDataArray = this.readSLArray(); // decodeMiscData()
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

  decodeSensorData() {
    var sensors = this.sensorDataArray;

    this.sensors = {};

    this.sensors.poolSolarPresent = this.isBitSet(sensors[0], 1);
    this.sensors.spaSolarPresent = this.isBitSet(sensors[0], 4);
    this.sensors.thermaFloCoolPresent = this.isBitSet(sensors[1], 1);
    this.sensors.solarHeatPumpPresent = this.isBitSet(sensors[2], 4);
    this.sensors.thermaFloPresent = this.isBitSet(sensors[2], 5);
  }

  decodeValveData() {
    var secondaries = this.getSecondariesCount();
    var isSolarValve0 = false;
    var isSolarValve1 = false;

    if (!this.sensors) {
      this.decodeSensorData();
    }

    if (this.sensors.poolSolarPresent && !this.sensors.solarHeatPumpPresent) {
      isSolarValve0 = true;
    }

    if (this.isDualBody()) {
      if (this.sensors.spaSolarPresent && !this.sensors.thermaFloPresent) {
        isSolarValve1 = true;
      }
    }

    var valveArray = [];

    for (var loadCenterIndex = 0; loadCenterIndex <= secondaries; loadCenterIndex++) {
      var loadCenterValveData = this.valveDataArray[loadCenterIndex];

      for (var valveIndex = 0; valveIndex < 5; valveIndex++) {
        var valveObject = {};

        var isSolarValve = false;
        if (loadCenterIndex === 0) {
          if (valveIndex === 0 && isSolarValve0) {
            isSolarValve = true;
          }
          if (valveIndex === 1 && isSolarValve1) {
            isSolarValve = true;
          }
        }
        if (this.isValvePresent(valveIndex, loadCenterValveData)) {
          var valveDataIndex = (loadCenterIndex * 5) + 4 + valveIndex;
          var deviceId = this.valveDataArray[valveDataIndex];
          if (deviceId === 0) {
            // console.log('unused valve, loadCenterIndex = ' + loadCenterIndex + ' valveIndex = ' + valveIndex);
          } else if (isSolarValve === true){
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
      }

    }
    this.valves = valveArray;
  }

  isValvePresent(valveIndex, loadCenterValveData) {
    if (valveIndex < 2) {
      return true;
    } else {
      return this.isBitSet(loadCenterValveData, valveIndex);
    }
  }

  decodeDelayData() {
    this.delays = {};

    this.delays.poolPumpOnDuringHeaterCooldown = this.isBitSet(this.delayDataArray[0], 0);
    this.delays.spaPumpOnDuringHeaterCooldown = this.isBitSet(this.delayDataArray[0], 1);
    this.delays.pumpOffDuringValveAction = this.isBitSet(this.delayDataArray[0], 7);
  }

  decodeMiscData() {
    this.misc = {};

    if (this.isBitSet(this.miscDataArray[3], 0) === false) {
      this.misc.intelliChem = false;
    } else {
      this.misc.intelliChem = true;
    }

    if (this.miscDataArray[4] !== 0) {
      this.misc.spaManualHeat = true;
    } else {
      this.misc.spaManualHeat = false;
    }
  }

  isDualBody() {
    return this.controllerType === 5;
  }
};
