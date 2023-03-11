"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentConfigurationMessage = void 0;
const index_1 = require("../../index");
class EquipmentConfigurationMessage {
    static decodeCircuitDefinitions(msg) {
        const cnt = msg.readUInt32LE();
        const res = [];
        for (let i = 0; i < cnt; i++) {
            const id = msg.readUInt32LE();
            const circuitName = msg.readSLString();
            res.push({ id, circuitName });
        }
        const data = {
            senderId: msg.senderId,
            circuits: res
        };
        return data;
    }
    static decodeNCircuitNames(msg) {
        const cnt = msg.readUInt8();
        return cnt;
    }
    static decodeCircuitNames(msg) {
        const size = msg.readUInt32LE();
        const res = [];
        for (let id = 1; id <= size; id++) {
            const circuitName = msg.readSLString();
            const data = {
                id,
                circuitName
            };
            res.push(data);
        }
        const data = {
            senderId: msg.senderId,
            circuits: res
        };
        return data;
    }
    static decodeControllerConfig(msg) {
        const controllerId = msg.readInt32LE() - 99;
        const minSetPoint = new Array(2);
        const maxSetPoint = new Array(2);
        for (let i = 0; i < 2; i++) {
            minSetPoint[i] = msg.readUInt8();
            maxSetPoint[i] = msg.readUInt8();
        }
        const degC = msg.readUInt8() !== 0;
        const controllerType = msg.readUInt8();
        const hwType = msg.readUInt8();
        const controllerData = msg.readUInt8();
        const equipFlags = msg.readInt32LE();
        const genCircuitName = msg.readSLString();
        const circuitCount = msg.readInt32LE();
        const circuitArray = new Array(circuitCount);
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
        for (let i = 0; i < circuitArray.length; i++) {
            // normalize to 1 based ids for default names; 100 based for custom names
            circuitArray[i].nameIndex = circuitArray[i].nameIndex < 101 ? circuitArray[i].nameIndex + 1 : circuitArray[i].nameIndex + 99;
        }
        const colorCount = msg.readInt32LE();
        const colorArray = new Array(colorCount);
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
        const pumpCircCount = 8;
        const pumpCircArray = new Array(pumpCircCount);
        for (let i = 0; i < pumpCircCount; i++) {
            pumpCircArray[i] = msg.readUInt8();
        }
        const interfaceTabFlags = msg.readInt32LE();
        const showAlarms = msg.readInt32LE();
        const equipment = {
            POOL_SOLARPRESENT: (equipFlags & 1) === 1,
            POOL_SOLARHEATPUMP: (equipFlags & 2) === 2,
            POOL_CHLORPRESENT: (equipFlags & 4) === 4,
            POOL_IBRITEPRESENT: (equipFlags & 8) === 8,
            POOL_IFLOWPRESENT0: (equipFlags & 16) === 16,
            POOL_IFLOWPRESENT1: (equipFlags & 32) === 32,
            POOL_IFLOWPRESENT2: (equipFlags & 64) === 64,
            POOL_IFLOWPRESENT3: (equipFlags & 128) === 128,
            POOL_IFLOWPRESENT4: (equipFlags & 256) === 256,
            POOL_IFLOWPRESENT5: (equipFlags & 512) === 512,
            POOL_IFLOWPRESENT6: (equipFlags & 1024) === 1024,
            POOL_IFLOWPRESENT7: (equipFlags & 2048) === 2048,
            POOL_NO_SPECIAL_LIGHTS: (equipFlags & 4096) === 4096,
            POOL_HEATPUMPHASCOOL: (equipFlags & 8192) === 8192,
            POOL_MAGICSTREAMPRESENT: (equipFlags & 16384) === 16384,
            POOL_ICHEMPRESENT: (equipFlags & 32768) === 32768
        };
        const data = {
            senderId: msg.senderId,
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
    static isEasyTouch(controllerType) {
        return controllerType === 14 || controllerType === 13;
    }
    static isIntelliTouch(controllerType) {
        return controllerType !== 14 && controllerType !== 13 && controllerType !== 10;
    }
    static isEasyTouchLite(controllerType, hwType) {
        return controllerType === 13 && (hwType & 4) !== 0;
    }
    static isDualBody(controllerType) {
        return controllerType === 5;
    }
    static isChem2(controllerType, hwType) {
        return controllerType === 252 && hwType === 2;
    }
    static decodeSetEquipmentConfigurationAck(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
    static decodeSetEquipmentConfiguration(msg) {
        msg.readSLArray();
        const speedDataArray = msg.readSLArray(); // 0 byte
        const valveDataArray = msg.readSLArray(); // decodeValveData()
        const remoteDataArray = msg.readSLArray();
        const heaterConfigDataArray = msg.readSLArray(); // decodeSensorData()
        const delayDataArray = msg.readSLArray(); // decodeDelayData()
        /*const macroDataArray =*/ msg.readSLArray();
        const miscDataArray = msg.readSLArray(); // decodeMiscData()
        const lightDataArray = msg.readSLArray();
        const pumpDataArray = msg.readSLArray();
        /*const spaFlowDataArray =*/ msg.readSLArray();
        /*const alarm =*/ msg.readUInt8();
        // const rawData = {
        //   highSpeedCircuitData: speedDataArray,
        //   valveData: valveDataArray,
        //   remoteData: remoteDataArray,
        //   heaterConfigData: heaterConfigDataArray,
        //   delayData: delayDataArray,
        //   macroData: macroDataArray,
        //   miscData: miscDataArray,
        //   lightData: lightDataArray,
        //   pumpData: pumpDataArray,
        //   spaFlowData: spaFlowDataArray,
        //   alarm
        // };
        const numPumps = this._getNumPumps(pumpDataArray);
        const pumps = [];
        for (let i = 0; i < numPumps; i++) {
            const pump = this._getPumpData(i, pumpDataArray);
            pumps.push(pump);
        }
        const heaterConfig = this._loadHeaterData(heaterConfigDataArray, msg);
        const valves = this._loadValveData(valveDataArray, heaterConfig, index_1.UnitConnection.controllerType, index_1.UnitConnection.expansionsCount, msg);
        const highSpeedCircuits = this._loadSpeedData(speedDataArray, index_1.UnitConnection.controllerType);
        const delays = this._loadDelayData(delayDataArray, msg);
        const lights = this._loadLightData(lightDataArray);
        const misc = this._loadMiscData(miscDataArray, msg);
        const remotes = this._loadRemoteData(remoteDataArray, index_1.UnitConnection.controllerType);
        const data = {
            senderId: msg.senderId,
            pumps,
            heaterConfig,
            valves,
            delays,
            misc,
            lights,
            highSpeedCircuits,
            remotes,
            numPumps,
            // rawData
        };
        return data;
    }
    static _getNumPumps(pumpDataArray) {
        if (pumpDataArray === null) {
            return 0;
        }
        let numPumps = 0;
        for (let i = 0; i < pumpDataArray.length; i += 45) {
            if (pumpDataArray[i] !== 0) {
                numPumps++;
            }
        }
        return numPumps;
    }
    static _getPumpData(pumpIndex, pumpDataArray) {
        const pumpIndexByte = 45 * pumpIndex;
        if (pumpDataArray === null || pumpDataArray.length < (pumpIndex + 1) * 45) {
            return null;
        }
        const id = pumpIndex + 1;
        const type = pumpDataArray[pumpIndexByte];
        let pentairType;
        let name;
        if ((type & 128) === 128) {
            pentairType = index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVS;
            name = 'Intelliflo VS';
        }
        else if ((type & 134) === 134) {
            pentairType = index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVS;
            name = 'Intelliflo VS Ultra Efficiency';
        }
        else if ((type & 169) === 169) {
            pentairType = index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVS;
            name = 'Intelliflo VS+SVRS';
        }
        else if ((type & 64) === 64) {
            pentairType = index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVSF;
            name = 'Intelliflo VSF';
        }
        else {
            pentairType = index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVF;
            name = 'Intelliflo VF';
        }
        const address = pumpIndex + 95;
        const circuits = [];
        let primingSpeed, primingTime, minSpeed, maxSpeed, speedStepSize;
        let backgroundCircuit, filterSize, turnovers, manualFilterGPM, minFlow, maxFlow, flowStepSize, maxSystemTime, maxPressureIncrease, backwashFlow, backwashTime, rinseTime, vacuumFlow, vacuumTime;
        if (pentairType === index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVS) {
            for (let circuitId = 1; circuitId <= 8; circuitId++) {
                const _circuit = pumpDataArray[pumpIndexByte + (circuitId * 2 + 2)];
                if (_circuit !== 0) {
                    const circuit = {
                        id: circuitId,
                        circuit: _circuit,
                        speed: pumpDataArray[pumpIndexByte + (circuitId * 2 + 3)] * 256 + pumpDataArray[pumpIndexByte + (circuitId + 20)],
                        units: 0
                    };
                    circuits.push(circuit);
                }
            }
            primingSpeed = pumpDataArray[pumpIndexByte + 20] * 256 + pumpDataArray[pumpIndexByte + 29];
            primingTime = pumpDataArray[pumpIndexByte + 1];
            minSpeed = 450;
            maxSpeed = 3450;
            speedStepSize = 10;
        }
        else if (pentairType === index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVF) {
            for (let circuitId = 1; circuitId <= 8; circuitId++) {
                const _circuit = pumpDataArray[pumpIndexByte + (circuitId * 2 + 2)];
                if (_circuit !== 0) {
                    const circuit = {
                        id: circuitId,
                        circuit: _circuit,
                        flow: pumpDataArray[pumpIndexByte + (circuitId * 2 + 3)],
                        units: 1
                    };
                    circuits.push(circuit);
                }
            }
            backgroundCircuit = pumpDataArray[pumpIndexByte];
            filterSize = pumpDataArray[pumpIndexByte + 1] * 1000;
            turnovers = pumpDataArray[pumpIndexByte + 2];
            manualFilterGPM = pumpDataArray[pumpIndexByte + 20];
            primingSpeed = pumpDataArray[pumpIndexByte + 21];
            primingTime = (pumpDataArray[pumpIndexByte + 22] & 0xf);
            minFlow = 15;
            maxFlow = 130;
            flowStepSize = 1;
            maxSystemTime = pumpDataArray[pumpIndexByte + 22] >> 4;
            maxPressureIncrease = pumpDataArray[pumpIndexByte + 23];
            backwashFlow = pumpDataArray[pumpIndexByte + 24];
            backwashTime = pumpDataArray[pumpIndexByte + 25];
            rinseTime = pumpDataArray[pumpIndexByte + 26];
            vacuumFlow = pumpDataArray[pumpIndexByte + 27];
            vacuumTime = pumpDataArray[pumpIndexByte + 29];
        }
        else if (pentairType === index_1.PumpTypes.PUMP_TYPE_INTELLIFLOVSF) {
            for (let circuitId = 1; circuitId <= 8; circuitId++) {
                const _circuit = pumpDataArray[pumpIndexByte + (circuitId * 2 + 2)];
                if (_circuit !== 0) {
                    const circuit = {
                        id: circuitId,
                        circuit: _circuit,
                        units: (pumpDataArray[pumpIndexByte + 3] >> circuitId - 1 & 1) === 0 ? 1 : 0
                    };
                    if (circuit.units) {
                        circuit.flow = pumpDataArray[pumpIndexByte + (circuitId * 2 + 3)];
                    }
                    else {
                        circuit.speed = pumpDataArray[pumpIndexByte + (circuitId * 2 + 3)] * 256 + pumpDataArray[pumpIndexByte + (circuitId + 20)];
                    }
                    circuits.push(circuit);
                }
            }
            speedStepSize = 10;
            flowStepSize = 1;
            minFlow = 15;
            maxFlow = 130;
            minSpeed = 450;
            maxSpeed = 3450;
        }
        const pump = {
            id,
            type,
            pentairType,
            name,
            address,
            circuits,
            primingSpeed,
            primingTime,
            minSpeed,
            maxSpeed,
            speedStepSize,
            backgroundCircuit,
            filterSize,
            turnovers,
            manualFilterGPM,
            minFlow,
            maxFlow,
            flowStepSize,
            maxSystemTime,
            maxPressureIncrease,
            backwashFlow,
            backwashTime,
            rinseTime,
            vacuumFlow,
            vacuumTime
        };
        return pump;
    }
    static _isValvePresent(valveIndex, loadCenterValveData, msg) {
        if (valveIndex < 2) {
            return true;
        }
        else {
            return msg.isBitSet(loadCenterValveData, valveIndex);
        }
    }
    static _loadHeaterData(heaterConfigDataArray, msg) {
        ///// Heater config
        const heaterConfig = {
            body1SolarPresent: msg.isBitSet(heaterConfigDataArray[0], 1),
            // body1HeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 4), // bHPump1
            solarHeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 4),
            body2SolarPresent: msg.isBitSet(heaterConfigDataArray[0], 4),
            thermaFloPresent: msg.isBitSet(heaterConfigDataArray[2], 5),
            // body2HeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 5),  // bHPump2
            thermaFloCoolPresent: msg.isBitSet(heaterConfigDataArray[1], 1),
            units: msg.isBitSet(heaterConfigDataArray[2], 0) ? 1 : 0 // 1 == celsius, 0 = fahrenheit
        };
        return heaterConfig;
        ///// End heater config
    }
    static _loadValveData(valveDataArray, heaterConfig, controllerType, expansionsCount, msg) {
        let bEnable1 = true;
        let bEnable2 = true;
        // let isSolarValve0 = false;
        // let isSolarValve1 = false;
        if (heaterConfig.body1SolarPresent && !heaterConfig.solarHeatPumpPresent) {
            bEnable1 = false;
        }
        if (heaterConfig.body2SolarPresent && !heaterConfig.thermaFloPresent && controllerType === 5) {
            bEnable2 = false;
        }
        const valves = [];
        for (let loadCenterIndex = 0; loadCenterIndex <= expansionsCount; loadCenterIndex++) {
            const loadCenterValveData = valveDataArray[loadCenterIndex];
            for (let valveIndex = 0; valveIndex < 5; valveIndex++) {
                let valveName;
                let loadCenterName;
                let deviceId;
                // let bEnable = true;
                // let isSolarValve = true;
                if (loadCenterIndex === 0) {
                    if (valveIndex === 0 && !bEnable1) {
                        // bEnable = false;
                    }
                    if (valveIndex === 1 && !bEnable2) {
                        // bEnable = false;
                    }
                }
                let bPresent = false;
                if (valveIndex < 2) {
                    bPresent = true;
                }
                else {
                    bPresent = this._isValvePresent(valveIndex, loadCenterValveData, msg);
                }
                if (bPresent) {
                    const valveDataIndex = (loadCenterIndex * 5) + 4 + valveIndex;
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
                    const v = {
                        loadCenterIndex,
                        valveIndex: valveIndex + 1,
                        valveName,
                        loadCenterName,
                        deviceId
                    };
                    valves.push(v);
                }
                // }
            }
        }
        return valves;
    }
    static _loadDelayData(delayDataArray, msg) {
        const delays = {
            poolPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 0),
            spaPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 1),
            pumpOffDuringValveAction: msg.isBitSet(delayDataArray[0], 7)
        };
        return delays;
    }
    static _loadMiscData(miscDataArray, msg) {
        const misc = {
            intelliChem: msg.isBitSet(miscDataArray[3], 0),
            manualHeat: msg.isBitSet(miscDataArray[4], 0)
        };
        return misc;
    }
    /*   private static _loadSpeedCircuits(speedDataArray, isPool) {
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
              let name = `string ${byCircuit}`
              let id = byCircuit;
              result.push([name, id]);
              // iCount++;
            } else {
              let circuit = byCircuit;
              if (circuit != null) {
                let name2 = 'get name from body array' //circuit.getM_Name();
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
      } */
    static _loadSpeedData(speedDataArray, controllerType) {
        const getRange = function () {
            const ret = { min: 0, max: 0 };
            ret.max = speedDataArray.length;
            if (EquipmentConfigurationMessage.isEasyTouch(controllerType)) {
                ret.max = 4;
            }
            if (EquipmentConfigurationMessage.isDualBody(controllerType)) {
                ret.max = 8; // 4;
                // what is 'isPoolData'?  Define both bodies as pool instead of
                // sep pool/spa types?  Or is spa 0-3 and pool 4-8?
                // if (isPoolData){
                //  ret.min = 0 + 4;
                //  ret.max = 4 + 4;
                // }
            }
            return ret;
        };
        const speed = [];
        const range = getRange();
        for (let i = range.min; i < range.max; i++) {
            if (speedDataArray[i] !== 0)
                speed.push(speedDataArray[i]);
        }
        return speed;
    }
    static _loadLightData(lightDataArray) {
        const lights = {
            allOnAllOff: []
        };
        for (let i = 0; i < 8; i++) {
            lights.allOnAllOff.push(lightDataArray[i]);
        }
        return lights;
    }
    static _loadRemoteData(remoteDataArray, controllerType) {
        const data = {
            fourButton: [],
            tenButton: [[]],
            quickTouch: []
        };
        if (EquipmentConfigurationMessage.isEasyTouch(controllerType)) {
            for (let i = 0; i < 4; i++) {
                data.fourButton.push(remoteDataArray[i]);
            }
            for (let i = 10; i < 20; i++) {
                data.tenButton[0].push(remoteDataArray[i]);
            }
        }
        else {
            // Intellitouch
            // RSG 1.6.23 - Per Screenlogic Config, the IS10#4 shares the bytes with IS4#1/IS4#2.
            //  Byte 1 - IS10#1-1  IS4#1-1
            //  Byte 2 - IS10#1-2  IS4#1-2
            //  Byte 3 - IS10#1-3  IS4#1-3
            //  Byte 4 - IS10#1-4  IS4#1-4
            //  Byte 5 - IS10#1-5  
            //  Byte 6 - IS10#1-6  IS4#2-1
            //  Byte 7 - IS10#1-7  IS4#2-2
            //  Byte 8 - IS10#1-8  IS4#2-3
            //  Byte 9 - IS10#1-9  IS4#2-4
            //  Byte 10 - IS10#1-10  
            data.tenButton.push([], [], []);
            for (let i = 0; i < 10; i++) {
                data.tenButton[0].push(remoteDataArray[i]);
            }
            for (let i = 10; i < 20; i++) {
                data.tenButton[1].push(remoteDataArray[i]);
            }
            for (let i = 20; i < 30; i++) {
                data.tenButton[2].push(remoteDataArray[i]);
            }
            for (let i = 30; i < 40; i++) {
                data.tenButton[3].push(remoteDataArray[i]);
            }
        }
        for (let i = 40; i < 44; i++) {
            data.quickTouch.push(remoteDataArray[i]);
        }
        return data;
    }
    static _loadSpaFlowData(spaFlowDataArray) {
        const spaFlow = {
            isActive: spaFlowDataArray[1] === 1,
            pumpId: spaFlowDataArray[5],
            stepSize: spaFlowDataArray[6]
        };
        return spaFlow;
    }
    static decodeGetEquipmentConfiguration(msg) {
        // const deviceIDToString = (poolConfig) => {
        //   switch (poolConfig) {
        //     case 128:
        //       return 'Solar_Active';
        //     case 129:
        //       return 'Pool_or_Spa_Heater_Active';
        //     case 130:
        //       return 'Pool_Heater_Active';
        //     case 131:
        //       return 'Spa_Heater_Active';
        //     case 132:
        //       return 'Freeze_Mode_Active';
        //     case 133:
        //       return 'Heat_Boost';
        //     case 134:
        //       return 'Heat_Enable';
        //     case 135:
        //       return 'Increment_Pump_Speed';
        //     case 136:
        //       return 'Decrement_Pump_Speed';
        //     case 137:
        //     case 138:
        //     case 139:
        //     case 140:
        //     case 141:
        //     case 142:
        //     case 143:
        //     case 144:
        //     case 145:
        //     case 146:
        //     case 147:
        //     case 148:
        //     case 149:
        //     case 150:
        //     case 151:
        //     case 152:
        //     case 153:
        //     case 154:
        //     default:
        //       // PoolCircuit pC = poolConfig.getCircuitByDeviceID(byID);
        //       // if (pC != null) {
        //       //     return pC.getM_Name();
        //       // }
        //       // return 'None';
        //       return `fix: poolConfig ${poolConfig}`;
        //     case 155:
        //       return 'Pool_Heater';
        //     case 156:
        //       return 'Spa_Heater';
        //     case 157:
        //       return 'Either_Heater';
        //     case 158:
        //       return 'Solar';
        //     case 159:
        //       return 'Freeze';
        //   }
        // };
        const controllerType = msg.readUInt8();
        const hardwareType = msg.readUInt8();
        msg.readUInt8();
        msg.readUInt8();
        const controllerData = msg.readInt32LE();
        const versionDataArray = msg.readSLArray();
        let version = 0;
        const speedDataArray = msg.readSLArray();
        const valveDataArray = msg.readSLArray(); // decodeValveData()
        const remoteDataArray = msg.readSLArray();
        const heaterConfigDataArray = msg.readSLArray(); // decodeSensorData()
        const delayDataArray = msg.readSLArray(); // decodeDelayData()
        const macroDataArray = msg.readSLArray();
        const miscDataArray = msg.readSLArray(); // decodeMiscData()
        const lightDataArray = msg.readSLArray();
        const pumpDataArray = msg.readSLArray();
        const sgDataArray = msg.readSLArray();
        const spaFlowDataArray = msg.readSLArray();
        const rawData = {
            versionData: versionDataArray,
            highSpeedCircuitData: speedDataArray,
            valveData: valveDataArray,
            remoteData: remoteDataArray,
            heaterConfigData: heaterConfigDataArray,
            delayData: delayDataArray,
            macroData: macroDataArray,
            miscData: miscDataArray,
            lightData: lightDataArray,
            pumpData: pumpDataArray,
            sgData: sgDataArray,
            spaFlowData: spaFlowDataArray
        };
        const expansionsCount = (controllerData & 192) >> 6 || 0;
        index_1.UnitConnection.controllerType = controllerData;
        index_1.UnitConnection.expansionsCount = expansionsCount;
        if (versionDataArray === null || versionDataArray.length < 2) {
            version = 0;
        }
        else
            version = (versionDataArray[0] * 1000) + (versionDataArray[1]);
        const numPumps = this._getNumPumps(pumpDataArray);
        const pumps = [];
        for (let i = 0; i < numPumps; i++) {
            const pump = this._getPumpData(i, pumpDataArray);
            pumps.push(pump);
        }
        const heaterConfig = this._loadHeaterData(heaterConfigDataArray, msg);
        const valves = this._loadValveData(valveDataArray, heaterConfig, controllerType, expansionsCount, msg);
        const highSpeedCircuits = this._loadSpeedData(speedDataArray, controllerType);
        const delays = this._loadDelayData(delayDataArray, msg);
        const lights = this._loadLightData(lightDataArray);
        const misc = this._loadMiscData(miscDataArray, msg);
        const remotes = this._loadRemoteData(remoteDataArray, controllerType);
        const spaFlow = this._loadSpaFlowData(spaFlowDataArray);
        const data = {
            senderId: msg.senderId,
            controllerType,
            hardwareType,
            expansionsCount,
            version,
            pumps,
            heaterConfig,
            valves,
            delays,
            lights,
            misc,
            highSpeedCircuits,
            remotes,
            spaFlow,
            numPumps,
            rawData
        };
        return data;
    }
    static decodeWeatherMessage(msg) {
        const version = msg.readInt32LE();
        const zip = msg.readSLString();
        const lastUpdate = msg.readSLDateTime();
        const lastRequest = msg.readSLDateTime();
        const dateText = msg.readSLString();
        const text = msg.readSLString();
        const currentTemperature = msg.readInt32LE();
        const humidity = msg.readInt32LE();
        const wind = msg.readSLString();
        const pressure = msg.readInt32LE();
        const dewPoint = msg.readInt32LE();
        const windChill = msg.readInt32LE();
        const visibility = msg.readInt32LE();
        const numDays = msg.readInt32LE();
        const dayData = new Array(numDays);
        for (let i = 0; i < numDays; i++) {
            dayData[i] = {
                dayTime: msg.readSLDateTime(),
                highTemp: msg.readInt32LE(),
                lowTemp: msg.readInt32LE(),
                text: msg.readSLString(),
            };
        }
        const sunrise = msg.readInt32LE();
        const sunset = msg.readInt32LE();
        const data = {
            senderId: msg.senderId,
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
        const readTimeTempPointsPairs = function () {
            const retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                const points = msg.readInt32LE();
                // 16 bytes per time, 4 bytes per temperature
                if (msg.length >= msg.readOffset + (points * (16 + 4))) {
                    for (let i = 0; i < points; i++) {
                        const time = msg.readSLDateTime();
                        const temp = msg.readInt32LE();
                        retval.push({
                            time: time,
                            temp: temp,
                        });
                    }
                }
            }
            return retval;
        };
        const readTimeTimePointsPairs = function () {
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
        const airTemps = readTimeTempPointsPairs();
        const poolTemps = readTimeTempPointsPairs();
        const poolSetPointTemps = readTimeTempPointsPairs();
        const spaTemps = readTimeTempPointsPairs();
        const spaSetPointTemps = readTimeTempPointsPairs();
        const poolRuns = readTimeTimePointsPairs();
        const spaRuns = readTimeTimePointsPairs();
        const solarRuns = readTimeTimePointsPairs();
        const heaterRuns = readTimeTimePointsPairs();
        const lightRuns = readTimeTimePointsPairs();
        const data = {
            senderId: msg.senderId,
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
                return 'Hight';
            }
            if (circuitIndex == 5) {
                return 'Low';
            }
        }
        else if (circuitIndex == 0) {
            return 'Spa';
        }
        else {
            if (circuitIndex == 5) {
                return 'Pool';
            }
        }
        return (circuitIndex <= 0 || circuitIndex >= 5) ? EquipmentConfigurationMessage.isEasyTouch(poolConfig.controllerType) ? circuitIndex <= 9 ? `Aux ${circuitIndex - 1}` : circuitIndex <= 17 ? `Feature ${circuitIndex - 9}` : circuitIndex == 19 ? 'Aux Extra' : `error ${circuitIndex}` : circuitIndex < 40 ? `Aux ${circuitIndex - 1}` : `Feature ${circuitIndex - 39}` : `Aux ${circuitIndex}`;
    }
    static decodeCustomNames(msg) {
        const nameCount = msg.readInt32LE();
        // msg.incrementReadOffset(0);
        const customNames = [];
        // const ro = msg.readOffset;
        for (let i = 0; i < nameCount; i++) {
            const n = msg.readSLString();
            customNames.push(n);
        }
        const data = {
            senderId: msg.senderId,
            names: customNames
        };
        return data;
    }
    static decodeSetCustomNameAck(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
}
exports.EquipmentConfigurationMessage = EquipmentConfigurationMessage;
//# sourceMappingURL=EquipmentConfig.js.map