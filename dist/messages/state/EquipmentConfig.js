"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentConfigurationMessage = void 0;
const index_1 = require("../../index");
class EquipmentConfigurationMessage {
    /*   public static decodeEquipmentStateResponse(msg: Inbound) {
        let data: SLEquipmentStateData;
        let ok = msg.readInt32LE();
        let freezeMode = msg.readUInt8();
        let remotes = msg.readUInt8();
        let poolDelay = msg.readUInt8();
        let spaDelay = msg.readUInt8();
        let cleanerDelay = msg.readUInt8();
        msg.incrementReadOffset(3);
        let airTemp = msg.readInt32LE();
        let bodiesCount = msg.readInt32LE();
        if (bodiesCount > 2) {
          bodiesCount = 2;
        }
    
        let currentTemp = new Array(bodiesCount);
        let heatStatus = new Array(bodiesCount);
        let setPoint = new Array(bodiesCount);
        let coolSetPoint = new Array(bodiesCount);
        let heatMode = new Array(bodiesCount);
    
        let bodies = [{ id: 1 } as any, bodiesCount > 1 ? { id: 2 } : undefined];
    
        for (let i = 0; i < bodiesCount; i++) {
          let bodyType = msg.readInt32LE();
          if (bodyType < 0 || bodyType >= 2) {
            bodyType = 0;
          }
          bodies[bodyType].currentTemp = currentTemp[bodyType] = msg.readInt32LE();
          bodies[bodyType].heatStatus = heatStatus[bodyType] = msg.readInt32LE();
          bodies[bodyType].setPoint = setPoint[bodyType] = msg.readInt32LE();
          bodies[bodyType].coolSetPoint = coolSetPoint[bodyType] = msg.readInt32LE();
          bodies[bodyType].heatMode = heatMode[bodyType] = msg.readInt32LE();
        }
    
        let circuitCount = msg.readInt32LE();
        let circuitArray = new Array(circuitCount);
        for (let i = 0; i < circuitCount; i++) {
          circuitArray[i] = {
            id: msg.readInt32LE() - 499,
            state: msg.readInt32LE(),
            colorSet: msg.readUInt8(),
            colorPos: msg.readUInt8(),
            colorStagger: msg.readUInt8(),
            delay: msg.readUInt8(),
          };
        }
    
        let pH = msg.readInt32LE() / 100;
        let orp = msg.readInt32LE();
        let saturation = msg.readInt32LE() / 100;
        let saltPPM = msg.readInt32LE() * 50;
        let pHTank = msg.readInt32LE();
        let orpTank = msg.readInt32LE();
        let alarms = msg.readInt32LE();
    
        data = {
          ok,
          freezeMode,
          remotes,
          poolDelay,
          spaDelay,
          cleanerDelay,
          airTemp,
          bodiesCount,
          bodies,
          currentTemp,
          heatStatus,
          setPoint,
          coolSetPoint,
          heatMode,
          circuitArray,
          pH,
          orp,
          saturation,
          saltPPM,
          pHTank,
          orpTank,
          alarms,
        };
        return data;
      } */
    static decodeControllerConfig(msg) {
        let controllerId = msg.readInt32LE() - 99;
        let minSetPoint = new Array(2);
        let maxSetPoint = new Array(2);
        for (let i = 0; i < 2; i++) {
            minSetPoint[i] = msg.readUInt8();
            maxSetPoint[i] = msg.readUInt8();
        }
        let degC = msg.readUInt8() !== 0;
        let controllerType = msg.readUInt8();
        let hwType = msg.readUInt8();
        let controllerData = msg.readUInt8();
        let equipFlags = msg.readInt32LE();
        let genCircuitName = msg.readSLString();
        let circuitCount = msg.readInt32LE();
        let circuitArray = new Array(circuitCount);
        for (let i = 0; i < circuitCount; i++) {
            circuitArray[i] = {
                circuitId: msg.readInt32LE() - 499,
                name: msg.readSLString(),
                nameIndex: msg.readUInt8(),
                function: msg.readUInt8(),
                interface: msg.readUInt8(),
                freeze: msg.readUInt8(),
                colorSet: msg.readUInt8(),
                colorPos: msg.readUInt8(),
                colorStagger: msg.readUInt8(),
                deviceId: msg.readUInt8(),
                eggTimer: msg.readUInt16LE(),
            };
            msg.incrementReadOffset(2);
        }
        let colorCount = msg.readInt32LE();
        let colorArray = new Array(colorCount);
        for (let i = 0; i < colorCount; i++) {
            colorArray[i] = {
                name: msg.readSLString(),
                color: {
                    r: msg.readInt32LE() & 0xff,
                    g: msg.readInt32LE() & 0xff,
                    b: msg.readInt32LE() & 0xff,
                },
            };
        }
        // RSG - This data doesn't look right.  Rely on pump config.
        let pumpCircCount = 8;
        let pumpCircArray = new Array(pumpCircCount);
        for (let i = 0; i < pumpCircCount; i++) {
            pumpCircArray[i] = msg.readUInt8();
        }
        let interfaceTabFlags = msg.readInt32LE();
        let showAlarms = msg.readInt32LE();
        let equipment = {
            POOL_SOLARPRESENT: (equipFlags & 1) === 1,
            POOL_SOLARHEATPUMP: (equipFlags & 2) === 1,
            POOL_CHLORPRESENT: (equipFlags & 4) === 1,
            POOL_IBRITEPRESENT: (equipFlags & 8) === 1,
            POOL_IFLOWPRESENT0: (equipFlags & 16) === 1,
            POOL_IFLOWPRESENT1: (equipFlags & 32) === 1,
            POOL_IFLOWPRESENT2: (equipFlags & 64) === 1,
            POOL_IFLOWPRESENT3: (equipFlags & 128) === 1,
            POOL_IFLOWPRESENT4: (equipFlags & 256) === 1,
            POOL_IFLOWPRESENT5: (equipFlags & 512) === 1,
            POOL_IFLOWPRESENT6: (equipFlags & 1024) === 1,
            POOL_IFLOWPRESENT7: (equipFlags & 2048) === 1,
            POOL_NO_SPECIAL_LIGHTS: (equipFlags & 4096) === 1,
            POOL_HEATPUMPHASCOOL: (equipFlags & 8192) === 1,
            POOL_MAGICSTREAMPRESENT: (equipFlags & 16384) === 1,
            POOL_ICHEMPRESENT: (equipFlags & 32768) === 1,
        };
        let data = {
            controllerId,
            minSetPoint,
            maxSetPoint,
            degC,
            controllerType,
            hwType,
            controllerData,
            equipment,
            genCircuitName,
            circuitCount,
            circuitArray,
            colorCount,
            colorArray,
            pumpCircCount,
            pumpCircArray,
            interfaceTabFlags,
            showAlarms
        };
        return data;
    }
    isEasyTouch(controllerType) {
        return controllerType === 14 || controllerType === 13;
    }
    isIntelliTouch(controllerType) {
        return controllerType !== 14 && controllerType !== 13 && controllerType !== 10;
    }
    isEasyTouchLite(controllerType, hwType) {
        return controllerType === 13 && (hwType & 4) !== 0;
    }
    isDualBody(controllerType) {
        return controllerType === 5;
    }
    isChem2(controllerType, hwType) {
        return controllerType === 252 && hwType === 2;
    }
    static decodeEquipmentConfiguration(msg) {
        let getNumPumps = function () {
            if (flowDataArray === null) {
                return 0;
            }
            let numPumps = 0;
            for (var i = 0; i < flowDataArray.length; i += 45) {
                if (flowDataArray[i] !== 0) {
                    numPumps++;
                }
            }
            return numPumps;
        };
        let getPumpType = function (pumpIndex) {
            if (typeof (pumpIndex) !== 'number') {
                return 0;
            }
            if (flowDataArray === null || flowDataArray.length < (pumpIndex + 1) * 45) {
                return 0;
            }
            // let pumpType = flowDataArray[(45 * pumpIndex) + 2];
            let pumpType = flowDataArray[(45 * pumpIndex)];
            if ((pumpType & 128) === 128) {
                return {
                    pumpType: index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVS,
                    name: 'Intelliflo VS'
                };
            }
            else if ((pumpType & 64) === 64) {
                return {
                    pumpType: index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVSF,
                    name: 'Intelliflo VSF'
                };
            }
            else {
                return {
                    pumpType: index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVF,
                    name: 'Intelliflo VF'
                };
            }
            return 0;
        };
        let isValvePresent = function (valveIndex, loadCenterValveData) {
            if (valveIndex < 2) {
                return true;
            }
            else {
                return msg.isBitSet(loadCenterValveData, valveIndex);
            }
        };
        let deviceIDToString = (poolConfig) => {
            switch (poolConfig) {
                case 128:
                    return 'Solar_Active';
                case 129:
                    return 'Pool_or_Spa_Heater_Active';
                case 130:
                    return 'Pool_Heater_Active';
                case 131:
                    return 'Spa_Heater_Active';
                case 132:
                    return 'Freeze_Mode_Active';
                case 133:
                    return 'Heat_Boost';
                case 134:
                    return 'Heat_Enable';
                case 135:
                    return 'Increment_Pump_Speed';
                case 136:
                    return 'Decrement_Pump_Speed';
                case 137:
                case 138:
                case 139:
                case 140:
                case 141:
                case 142:
                case 143:
                case 144:
                case 145:
                case 146:
                case 147:
                case 148:
                case 149:
                case 150:
                case 151:
                case 152:
                case 153:
                case 154:
                default:
                    // PoolCircuit pC = poolConfig.getCircuitByDeviceID(byID);
                    // if (pC != null) {
                    //     return pC.getM_Name();
                    // }
                    // return 'None';
                    return `fix: poolConfig ${poolConfig}`;
                case 155:
                    return 'Pool_Heater';
                case 156:
                    return 'Spa_Heater';
                case 157:
                    return 'Either_Heater';
                case 158:
                    return 'Solar';
                case 159:
                    return 'Freeze';
            }
        };
        let loadSpeedCircuits = (speedDataArray, isPool) => {
            // let  loadSpeedCircuits(poolConfig,isPool) {
            // ArrayList<Pair<String, Integer>> result = new ArrayList<>();
            let result = new Array();
            // Pair<Integer, Integer> minMax = getRange(poolConfig, isPool);
            let minMax = [0, 255];
            // int iMin = ((Integer) minMax.first).intValue();
            // int iMax = ((Integer) minMax.second).intValue();
            let iMin = minMax[0];
            let iMax = minMax[1];
            // let iCount = 0;
            for (let i = iMin; i < iMax; i++) {
                // let byCircuit = poolConfig.getEquipconfig().getSpeedDataArray().get(i);
                let byCircuit = speedDataArray[i];
                if (byCircuit > 0) {
                    if (byCircuit >= 128 && byCircuit <= 132) {
                        // let name = get().deviceIDToString(poolConfig, byCircuit);
                        let name = `string ${byCircuit}`;
                        let id = byCircuit;
                        result.push([name, id]);
                        // iCount++;
                    }
                    else {
                        let circuit = byCircuit;
                        if (circuit != null) {
                            let name2 = 'get name from body array'; //circuit.getM_Name();
                            let id2 = byCircuit;
                            result.push([name2, id2]);
                            // iCount++;
                        }
                    }
                }
            }
            // if (iCount < iMax - iMin) {
            // }
            return result;
        };
        let getRange = function () {
            let ret = { min: 0, max: 0 };
            ret.max = speedDataArray.length;
            if (this.isEasyTouch(controllerType)) {
                ret.max = 4;
            }
            if (this.isDualBody(controllerType)) {
                ret.max = 4;
                // what is 'isPoolData'?  Define both bodies as pool instead of
                // sep pool/spa types?
                // if (isPoolData){
                //  ret.min = 0 + 4;
                //  ret.max = 4 + 4;
                // }
            }
        };
        let controllerType = msg.readUInt8();
        let hardwareType = msg.readUInt8();
        msg.readUInt8();
        msg.readUInt8();
        let controllerData = msg.readInt32LE();
        let versionDataArray = msg.readSLArray();
        let version = 0;
        let speedDataArray = msg.readSLArray();
        let valveDataArray = msg.readSLArray(); // decodeValveData()
        let remoteDataArray = msg.readSLArray();
        let heaterConfigDataArray = msg.readSLArray(); // decodeSensorData()
        let delayDataArray = msg.readSLArray(); // decodeDelayData()
        let macroDataArray = msg.readSLArray();
        let miscDataArray = msg.readSLArray(); // decodeMiscData()
        let lightDataArray = msg.readSLArray();
        let flowDataArray = msg.readSLArray();
        let sgDataArray = msg.readSLArray();
        let spaFlowDataArray = msg.readSLArray();
        let expansionsCount = (controllerData & 192) >> 6 || 0;
        if (versionDataArray === null || versionDataArray.length < 2) {
            version = 0;
        }
        else
            version = (versionDataArray[0] * 1000) + (versionDataArray[1]);
        let numPumps = getNumPumps();
        let pumps = [];
        for (let i = 0; i < numPumps; i++) {
            let pump = { id: i + 1 };
            pump = Object.assign(pump, getPumpType(i));
            pumps.push(pump);
        }
        // let sensors = msg.decodeHeaterConfigData(heaterConfigDataArray);
        ///// Heater config
        let heaterConfig = {
            body1SolarPresent: msg.isBitSet(heaterConfigDataArray[0], 1),
            body1HeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 4),
            // solarHeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 4),  // ?? bHPump1
            body2SolarPresent: msg.isBitSet(heaterConfigDataArray[0], 4),
            thermaFloPresent: msg.isBitSet(heaterConfigDataArray[2], 5),
            // body2HeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 5),  // bHPump2
            thermaFloCoolPresent: msg.isBitSet(heaterConfigDataArray[1], 1), // ?? Source?
        };
        ///// End heater config
        ///// Valve decode
        var bEnable1 = true;
        var bEnable2 = true;
        // var isSolarValve0 = false;
        // var isSolarValve1 = false;
        if (heaterConfig.body1SolarPresent && !heaterConfig.body1HeatPumpPresent) {
            bEnable1 = false;
        }
        if (heaterConfig.body2SolarPresent && !heaterConfig.thermaFloPresent && controllerType === 5) {
            bEnable2 = false;
        }
        var valves = [];
        for (let loadCenterIndex = 0; loadCenterIndex <= expansionsCount; loadCenterIndex++) {
            let loadCenterValveData = valveDataArray[loadCenterIndex];
            for (var valveIndex = 0; valveIndex < 5; valveIndex++) {
                let valveName;
                let loadCenterName;
                let deviceId;
                var bEnable = true;
                // var isSolarValve = true;
                if (loadCenterIndex === 0) {
                    if (valveIndex === 0 && !bEnable1) {
                        bEnable = false;
                    }
                    if (valveIndex === 1 && !bEnable2) {
                        bEnable = false;
                    }
                }
                let bPresent = false;
                if (valveIndex < 2) {
                    bPresent = true;
                }
                else {
                    bPresent = isValvePresent(valveIndex, loadCenterValveData);
                }
                if (bPresent) {
                    var valveDataIndex = (loadCenterIndex * 5) + 4 + valveIndex;
                    deviceId = valveDataArray[valveDataIndex];
                    valveName = String.fromCharCode(65 + valveIndex);
                    if (deviceId !== 0) {
                        console.log('unused valve, loadCenterIndex = ' + loadCenterIndex + ' valveIndex = ' + valveIndex);
                        // } else if (isSolarValve === true) {
                        //   // console.log('used by solar');
                    }
                    else {
                        loadCenterName = (loadCenterIndex + 1).toString();
                    }
                    let v = {
                        loadCenterIndex,
                        valveIndex,
                        valveName,
                        loadCenterName,
                        deviceId
                    };
                    valves.push(v);
                }
                // }
            }
        }
        ///// End Valve decode
        ///// Speed Data decode
        ///// End Valve decode
        ///// Delays
        let delays = {
            poolPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 0),
            spaPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 1),
            pumpOffDuringValveAction: msg.isBitSet(delayDataArray[0], 7)
        };
        ///// End Delays
        let misc = {
            intelliChem: msg.isBitSet(miscDataArray[3], 0),
            spaManualHeat: miscDataArray[4] !== 0
        };
        let speed = [];
        // RSG - speed doesn't look right.
        // speed = loadSpeedCircuits(speedDataArray, true);
        let data = {
            controllerType,
            hardwareType,
            expansionsCount,
            version,
            pumps,
            heaterConfig,
            valves,
            delays,
            misc,
            speed
        };
        return data;
    }
    static decodeWeatherMessage(msg) {
        let version = msg.readInt32LE();
        let zip = msg.readSLString();
        let lastUpdate = msg.readSLDateTime();
        let lastRequest = msg.readSLDateTime();
        let dateText = msg.readSLString();
        let text = msg.readSLString();
        let currentTemperature = msg.readInt32LE();
        let humidity = msg.readInt32LE();
        let wind = msg.readSLString();
        let pressure = msg.readInt32LE();
        let dewPoint = msg.readInt32LE();
        let windChill = msg.readInt32LE();
        let visibility = msg.readInt32LE();
        let numDays = msg.readInt32LE();
        let dayData = new Array(numDays);
        for (let i = 0; i < numDays; i++) {
            dayData[i] = {
                dayTime: msg.readSLDateTime(),
                highTemp: msg.readInt32LE(),
                lowTemp: msg.readInt32LE(),
                text: msg.readSLString(),
            };
        }
        let sunrise = msg.readInt32LE();
        let sunset = msg.readInt32LE();
        let data = {
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
        return data;
    }
    static decodeGetHistory(msg) {
        let readTimeTempPointsPairs = function () {
            let retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                let points = msg.readInt32LE();
                // 16 bytes per time, 4 bytes per temperature
                if (msg.length >= msg.readOffset + (points * (16 + 4))) {
                    for (let i = 0; i < points; i++) {
                        let time = msg.readSLDateTime();
                        let temp = msg.readInt32LE();
                        retval.push({
                            time: time,
                            temp: temp,
                        });
                    }
                }
            }
            return retval;
        };
        let readTimeTimePointsPairs = function () {
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
        let airTemps = readTimeTempPointsPairs();
        let poolTemps = readTimeTempPointsPairs();
        let poolSetPointTemps = readTimeTempPointsPairs();
        let spaTemps = readTimeTempPointsPairs();
        let spaSetPointTemps = readTimeTempPointsPairs();
        let poolRuns = readTimeTimePointsPairs();
        let spaRuns = readTimeTimePointsPairs();
        let solarRuns = readTimeTimePointsPairs();
        let heaterRuns = readTimeTimePointsPairs();
        let lightRuns = readTimeTimePointsPairs();
        let data = {
            airTemps,
            poolTemps,
            poolSetPointTemps,
            spaTemps,
            spaSetPointTemps,
            poolRuns,
            spaRuns,
            solarRuns,
            heaterRuns,
            lightRuns
        };
        return data;
    }
    getCircuitName(poolConfig, circuitIndex) {
        if (poolConfig.controllerType === 3 || poolConfig.controllerType === 4) {
            if (circuitIndex == 0) {
                return "Hight";
            }
            if (circuitIndex == 5) {
                return "Low";
            }
        }
        else if (circuitIndex == 0) {
            return "Spa";
        }
        else {
            if (circuitIndex == 5) {
                return "Pool";
            }
        }
        return (circuitIndex <= 0 || circuitIndex >= 5) ? this.isEasyTouch(poolConfig) ? circuitIndex <= 9 ? `Aux ${circuitIndex - 1}` : circuitIndex <= 17 ? `Feature ${circuitIndex - 9}` : circuitIndex == 19 ? "Aux Extra" : `error ${circuitIndex}` : circuitIndex < 40 ? `Aux ${circuitIndex - 1}` : `Feature ${circuitIndex - 39}` : `Aux ${circuitIndex}`;
    }
}
exports.EquipmentConfigurationMessage = EquipmentConfigurationMessage;
//# sourceMappingURL=EquipmentConfig.js.map