'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLSendEquipmentConfigurationMessage = exports.SLReceiveEquipmentConfigurationMessage = void 0;
const SLMessage_1 = require("./SLMessage");
const _MSG_ID = 12566;
class SLReceiveEquipmentConfigurationMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(buf, senderId) {
        super();
        this.createFromBuffer(buf);
        // anything to do here?
        this.decode();
    }
    data;
    decode() {
        super.decode();
        let controllerType = this.readUInt8();
        let hardwareType = this.readUInt8();
        this.readUInt8();
        this.readUInt8();
        let controllerData = this.readInt32LE();
        let versionDataArray = this.readSLArray();
        let version = 0;
        let speedDataArray = this.readSLArray();
        let valveDataArray = this.readSLArray(); // decodeValveData()
        let remoteDataArray = this.readSLArray();
        let heaterConfigDataArray = this.readSLArray(); // decodeSensorData()
        let delayDataArray = this.readSLArray(); // decodeDelayData()
        let macroDataArray = this.readSLArray();
        let miscDataArray = this.readSLArray(); // decodeMiscData()
        let lightDataArray = this.readSLArray();
        let flowDataArray = this.readSLArray();
        let sgDataArray = this.readSLArray();
        let spaFlowDataArray = this.readSLArray();
        let expansionsCount = (controllerData & 0x11000000) >> 6;
        if (versionDataArray === null || versionDataArray.length < 2) {
            version = 0;
        }
        else
            version = (versionDataArray[0] * 1000) + (versionDataArray[1]);
        let numPumps = this.getNumPumps(flowDataArray);
        let pumps = [];
        for (let i = 0; i < numPumps; i++) {
            let pump = { id: i + 1 };
            pump.type = this.getPumpType(i, flowDataArray);
        }
        // let sensors = this.decodeHeaterConfigData(heaterConfigDataArray);
        ///// Heater config
        let heaterConfig = {
            poolSolarPresent: this.isBitSet(heaterConfigDataArray[0], 1),
            spaSolarPresent: this.isBitSet(heaterConfigDataArray[0], 4),
            thermaFloCoolPresent: this.isBitSet(heaterConfigDataArray[1], 1),
            solarHeatPumpPresent: this.isBitSet(heaterConfigDataArray[2], 4),
            thermaFloPresent: this.isBitSet(heaterConfigDataArray[2], 5)
        };
        ///// End heater config
        ///// Valve decode
        var isSolarValve0 = false;
        var isSolarValve1 = false;
        // if (!heaterConfig) {
        //   this.decodeHeaterConfigData();
        // }
        if (heaterConfig.poolSolarPresent && !heaterConfig.solarHeatPumpPresent) {
            isSolarValve0 = true;
        }
        if (this.isDualBody(controllerType)) {
            if (heaterConfig.spaSolarPresent && !heaterConfig.thermaFloPresent) {
                isSolarValve1 = true;
            }
        }
        var valves = [];
        for (var loadCenterIndex = 0; loadCenterIndex <= expansionsCount; loadCenterIndex++) {
            var loadCenterValveData = valveDataArray[loadCenterIndex];
            for (var valveIndex = 0; valveIndex < 5; valveIndex++) {
                let loadCenterIndex;
                let valveIndex;
                let valveName;
                let loadCenterName;
                let deviceId;
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
                    deviceId = valveDataArray[valveDataIndex];
                    if (deviceId === 0) {
                        // console.log('unused valve, loadCenterIndex = ' + loadCenterIndex + ' valveIndex = ' + valveIndex);
                    }
                    else if (isSolarValve === true) {
                        // console.log('used by solar');
                    }
                    else {
                        loadCenterIndex = loadCenterIndex;
                        valveIndex = valveIndex;
                        valveName = String.fromCharCode(65 + valveIndex);
                        loadCenterName = (loadCenterIndex + 1).toString();
                        deviceId = deviceId;
                        let v = {
                            loadCenterIndex,
                            valveIndex,
                            valveName,
                            loadCenterName,
                            deviceId
                        };
                        valves.push(v);
                    }
                }
            }
        }
        // this.valves = valveArray;
        ///// End Valve decode
        ///// Delays
        let delays = {
            poolPumpOnDuringHeaterCooldown: this.isBitSet(delayDataArray[0], 0),
            spaPumpOnDuringHeaterCooldown: this.isBitSet(delayDataArray[0], 1),
            pumpOffDuringValveAction: this.isBitSet(delayDataArray[0], 7)
        };
        ///// End Delays
        let misc = {
            intelliChem: this.isBitSet(miscDataArray[3], 0),
            spaManualHeat: miscDataArray[4] !== 0
        };
        this.data = {
            controllerType,
            hardwareType,
            expansionsCount,
            version,
            heaterConfig,
            valves,
            delays,
            misc
        };
    }
    // getVersion() {
    //   if (this.versionDataArray === null || this.versionDataArray.length < 2) {
    //     return 0;
    //   }
    //   return (this.versionDataArray[0] * 1000) + (this.versionDataArray[1]);
    // }
    // getExpansionsCount(controllerData: number) {
    //   return (controllerData & 0x11000000) >> 6;
    // }
    getPumpType(pumpIndex, flowDataArray) {
        if (typeof (pumpIndex) !== 'number') {
            return 0;
        }
        if (flowDataArray === null || flowDataArray.length < (pumpIndex + 1) * 45) {
            return 0;
        }
        let pumpType = flowDataArray[(45 * pumpIndex) + 2];
        if (pumpType <= 3) {
            return pumpType;
        }
        return 0;
    }
    getCircuitRPMs(pumpIndex, circuitDeviceId, flowDataArray) {
        if (typeof (pumpIndex) !== 'number' || typeof (circuitDeviceId) !== 'number') {
            return 0;
        }
        if (pumpIndex < 0 || pumpIndex >= 8) {
            return 0;
        }
        if (flowDataArray === null || flowDataArray.length < (pumpIndex + 1) * 45) {
            return 0;
        }
        for (var i = 0; i < 8; i++) {
            let offset = (45 * pumpIndex) + 4 + (i * 2);
            if (flowDataArray[offset] === circuitDeviceId) {
                let upperBits = flowDataArray[offset + 1];
                let lowerBits = flowDataArray[offset + (16 - (i * 2)) + 1 + i];
                return (upperBits << 8) + lowerBits;
            }
        }
        return 0;
    }
    getNumPumps(flowDataArray) {
        if (flowDataArray === null) {
            return 0;
        }
        let numPumps = 0;
        for (var i = 0; i < flowDataArray.length; i += 45) {
            if (flowDataArray[i + 2] !== 0) {
                numPumps++;
            }
        }
        return numPumps;
    }
    // decodeHeaterConfigData(sensorDataArray: number[]) {
    //   let heaterConfig = {
    //    poolSolarPresent: this.isBitSet(sensorDataArray[0], 1),
    //    spaSolarPresent: this.isBitSet(sensorDataArray[0], 4),
    //    thermaFloCoolPresent: this.isBitSet(sensorDataArray[1], 1),
    //    solarHeatPumpPresent: this.isBitSet(sensorDataArray[2], 4),
    //    thermaFloPresent: this.isBitSet(sensorDataArray[2], 5)
    //   };
    //   return heaterConfig;
    // }
    decodeValveData() {
        // var expansions = this.getExpansionsCount();
        // var isSolarValve0 = false;
        // var isSolarValve1 = false;
        // if (!this.sensors) {
        //   this.decodeHeaterConfigData();
        // }
        // if (this.sensors.poolSolarPresent && !this.sensors.solarHeatPumpPresent) {
        //   isSolarValve0 = true;
        // }
        // if (this.isDualBody()) {
        //   if (this.sensors.spaSolarPresent && !this.sensors.thermaFloPresent) {
        //     isSolarValve1 = true;
        //   }
        // }
        // var valveArray = [];
        // for (var loadCenterIndex = 0; loadCenterIndex <= expansions; loadCenterIndex++) {
        //   var loadCenterValveData = this.valveDataArray[loadCenterIndex];
        //   for (var valveIndex = 0; valveIndex < 5; valveIndex++) {
        //     let valveObject:{
        //       loadCenterIndex: number,
        //       valveIndex: number,
        //       valveName: string,
        //       loadCenterName: string,
        //       deviceId: any
        //     } = {
        //       loadCenterIndex: undefined,
        //       valveIndex: undefined,
        //       valveName: undefined,
        //       loadCenterName: undefined,
        //       deviceId: undefined
        //     };
        //     var isSolarValve = false;
        //     if (loadCenterIndex === 0) {
        //       if (valveIndex === 0 && isSolarValve0) {
        //         isSolarValve = true;
        //       }
        //       if (valveIndex === 1 && isSolarValve1) {
        //         isSolarValve = true;
        //       }
        //     }
        //     if (this.isValvePresent(valveIndex, loadCenterValveData)) {
        //       var valveDataIndex = (loadCenterIndex * 5) + 4 + valveIndex;
        //       var deviceId = this.valveDataArray[valveDataIndex];
        //       if (deviceId === 0) {
        //         // console.log('unused valve, loadCenterIndex = ' + loadCenterIndex + ' valveIndex = ' + valveIndex);
        //       } else if (isSolarValve === true){
        //         // console.log('used by solar');
        //       } else {
        //         valveObject.loadCenterIndex = loadCenterIndex;
        //         valveObject.valveIndex = valveIndex;
        //         valveObject.valveName = String.fromCharCode(65 + valveIndex);
        //         valveObject.loadCenterName = (loadCenterIndex + 1).toString();
        //         valveObject.deviceId = deviceId;
        //         valveArray.push(valveObject);
        //       }
        //     }
        //   }
        // }
        // this.valves = valveArray;
    }
    isValvePresent(valveIndex, loadCenterValveData) {
        if (valveIndex < 2) {
            return true;
        }
        else {
            return this.isBitSet(loadCenterValveData, valveIndex);
        }
    }
    // decodeDelayData() {
    //   this.delays = {
    //     poolPumpOnDuringHeaterCooldown: this.isBitSet(this.delayDataArray[0], 0),
    //     spaPumpOnDuringHeaterCooldown: this.isBitSet(this.delayDataArray[0], 1),
    //     pumpOffDuringValveAction: this.isBitSet(this.delayDataArray[0], 7)
    //   } as Delays;
    // }
    // decodeMiscData() {
    //   this.misc = {
    //     intelliChem: this.isBitSet(this.miscDataArray[3], 0),
    //     spaManualHeat: this.miscDataArray[4] !== 0
    //   };
    // }
    isDualBody(controllerType) {
        return controllerType === 5;
    }
    get() {
        return this.data;
    }
}
exports.SLReceiveEquipmentConfigurationMessage = SLReceiveEquipmentConfigurationMessage;
;
class SLSendEquipmentConfigurationMessage extends SLMessage_1.SLMessage {
    static MSG_ID = _MSG_ID;
    constructor(senderId) {
        super();
        this.createBaseMessage();
        // this.addHeader(senderId, _MSG_ID);
        this.writeInt32LE(0);
        this.writeInt32LE(0);
    }
}
exports.SLSendEquipmentConfigurationMessage = SLSendEquipmentConfigurationMessage;
//# sourceMappingURL=SLEquipmentConfigurationMessage.js.map