"use strict";
exports.__esModule = true;
exports.EquipmentStateMessage = void 0;
var EquipmentStateMessage = /** @class */ (function () {
    function EquipmentStateMessage() {
    }
    EquipmentStateMessage.decodeEquipmentStateResponse = function (msg) {
        var data;
        var ok = msg.readInt32LE();
        var freezeMode = msg.readUInt8();
        var remotes = msg.readUInt8();
        var poolDelay = msg.readUInt8();
        var spaDelay = msg.readUInt8();
        var cleanerDelay = msg.readUInt8();
        msg.incrementReadOffset(3);
        var airTemp = msg.readInt32LE();
        var bodiesCount = msg.readInt32LE();
        if (bodiesCount > 2) {
            bodiesCount = 2;
        }
        var currentTemp = new Array(bodiesCount);
        var heatStatus = new Array(bodiesCount);
        var setPoint = new Array(bodiesCount);
        var coolSetPoint = new Array(bodiesCount);
        var heatMode = new Array(bodiesCount);
        var bodies = [{ id: 1 }, bodiesCount > 1 ? { id: 2 } : undefined];
        for (var i = 0; i < bodiesCount; i++) {
            var bodyType = msg.readInt32LE();
            if (bodyType < 0 || bodyType >= 2) {
                bodyType = 0;
            }
            bodies[bodyType].currentTemp = currentTemp[bodyType] = msg.readInt32LE();
            bodies[bodyType].heatStatus = heatStatus[bodyType] = msg.readInt32LE();
            bodies[bodyType].setPoint = setPoint[bodyType] = msg.readInt32LE();
            bodies[bodyType].coolSetPoint = coolSetPoint[bodyType] = msg.readInt32LE();
            bodies[bodyType].heatMode = heatMode[bodyType] = msg.readInt32LE();
        }
        var circuitCount = msg.readInt32LE();
        var circuitArray = new Array(circuitCount);
        for (var i = 0; i < circuitCount; i++) {
            circuitArray[i] = {
                id: msg.readInt32LE() - 499,
                state: msg.readInt32LE(),
                colorSet: msg.readUInt8(),
                colorPos: msg.readUInt8(),
                colorStagger: msg.readUInt8(),
                delay: msg.readUInt8()
            };
        }
        var pH = msg.readInt32LE() / 100;
        var orp = msg.readInt32LE();
        var saturation = msg.readInt32LE() / 100;
        var saltPPM = msg.readInt32LE() * 50;
        var pHTank = msg.readInt32LE();
        var orpTank = msg.readInt32LE();
        var alarms = msg.readInt32LE();
        data = {
            ok: ok,
            freezeMode: freezeMode,
            remotes: remotes,
            poolDelay: poolDelay,
            spaDelay: spaDelay,
            cleanerDelay: cleanerDelay,
            airTemp: airTemp,
            bodiesCount: bodiesCount,
            bodies: bodies,
            currentTemp: currentTemp,
            heatStatus: heatStatus,
            setPoint: setPoint,
            coolSetPoint: coolSetPoint,
            heatMode: heatMode,
            circuitArray: circuitArray,
            pH: pH,
            orp: orp,
            saturation: saturation,
            saltPPM: saltPPM,
            pHTank: pHTank,
            orpTank: orpTank,
            alarms: alarms
        };
        return data;
    };
    EquipmentStateMessage.decodeControllerConfig = function (msg) {
        var controllerId = msg.readInt32LE();
        var minSetPoint = new Array(2);
        var maxSetPoint = new Array(2);
        for (var i = 0; i < 2; i++) {
            minSetPoint[i] = msg.readUInt8();
            maxSetPoint[i] = msg.readUInt8();
        }
        var degC = msg.readUInt8() !== 0;
        var controllerType = msg.readUInt8();
        var hwType = msg.readUInt8();
        var controllerData = msg.readUInt8();
        var equipFlags = msg.readInt32LE();
        var genCircuitName = msg.readSLString();
        var circuitCount = msg.readInt32LE();
        var bodyArray = new Array(circuitCount);
        for (var i = 0; i < circuitCount; i++) {
            bodyArray[i] = {
                circuitId: msg.readInt32LE() - 499,
                name: msg.readSLString(),
                nameIndex: msg.readUInt8(),
                "function": msg.readUInt8(),
                interface: msg.readUInt8(),
                flags: msg.readUInt8(),
                colorSet: msg.readUInt8(),
                colorPos: msg.readUInt8(),
                colorStagger: msg.readUInt8(),
                deviceId: msg.readUInt8(),
                dfaultRt: msg.readUInt16LE()
            };
            msg.incrementReadOffset(2);
        }
        var colorCount = msg.readInt32LE();
        var colorArray = new Array(colorCount);
        for (var i = 0; i < colorCount; i++) {
            colorArray[i] = {
                name: msg.readSLString(),
                color: {
                    r: msg.readInt32LE() & 0xff,
                    g: msg.readInt32LE() & 0xff,
                    b: msg.readInt32LE() & 0xff
                }
            };
        }
        var pumpCircCount = 8;
        var pumpCircArray = new Array(pumpCircCount);
        for (var i = 0; i < pumpCircCount; i++) {
            pumpCircArray[i] = msg.readUInt8();
        }
        var interfaceTabFlags = msg.readInt32LE();
        var showAlarms = msg.readInt32LE();
        var data = {
            controllerId: controllerId,
            minSetPoint: minSetPoint,
            maxSetPoint: maxSetPoint,
            degC: degC,
            controllerType: controllerType,
            hwType: hwType,
            controllerData: controllerData,
            equipFlags: equipFlags,
            genCircuitName: genCircuitName,
            circuitCount: circuitCount,
            bodyArray: bodyArray,
            colorCount: colorCount,
            colorArray: colorArray,
            pumpCircCount: pumpCircCount,
            pumpCircArray: pumpCircArray,
            interfaceTabFlags: interfaceTabFlags,
            showAlarms: showAlarms
        };
        return data;
    };
    EquipmentStateMessage.decodeSystemTime = function (msg) {
        var date = msg.readSLDateTime();
        var year = date.getFullYear();
        var month = date.getMonth() + 1; // + 1 is for backward compatibility, SLTime represents months as 1-based
        var dayOfWeek = date.getDay(); // should probably be tweaked to adjust what days are 0-6 as SLTime and Javascript start on different days of the week
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var millisecond = date.getMilliseconds();
        var adjustForDST = msg.readInt32LE() === 1;
        var data = {
            date: date,
            year: year,
            month: month,
            dayOfWeek: dayOfWeek,
            day: day,
            hour: hour,
            minute: minute,
            second: second,
            millisecond: millisecond,
            adjustForDST: adjustForDST
        };
        return data;
    };
    EquipmentStateMessage.decodeCancelDelay = function (msg) {
        // ack
        return true;
    };
    EquipmentStateMessage.decodeSetSystemTime = function (msg) {
        // ack
        return true;
    };
    EquipmentStateMessage.prototype.isEasyTouch = function (controllerType) {
        return controllerType === 14 || controllerType === 13;
    };
    EquipmentStateMessage.prototype.isIntelliTouch = function (controllerType) {
        return controllerType !== 14 && controllerType !== 13 && controllerType !== 10;
    };
    EquipmentStateMessage.prototype.isEasyTouchLite = function (controllerType, hwType) {
        return controllerType === 13 && (hwType & 4) !== 0;
    };
    EquipmentStateMessage.prototype.isDualBody = function (controllerType) {
        return controllerType === 5;
    };
    EquipmentStateMessage.prototype.isChem2 = function (controllerType, hwType) {
        return controllerType === 252 && hwType === 2;
    };
    EquipmentStateMessage.decodeEquipmentConfiguration = function (msg) {
        var getNumPumps = function () {
            if (flowDataArray === null) {
                return 0;
            }
            var numPumps = 0;
            for (var i = 0; i < flowDataArray.length; i += 45) {
                if (flowDataArray[i + 2] !== 0) {
                    numPumps++;
                }
            }
            return numPumps;
        };
        var getPumpType = function (pumpIndex) {
            if (typeof (pumpIndex) !== 'number') {
                return 0;
            }
            if (flowDataArray === null || flowDataArray.length < (pumpIndex + 1) * 45) {
                return 0;
            }
            var pumpType = flowDataArray[(45 * pumpIndex) + 2];
            if (pumpType <= 3) {
                return pumpType;
            }
            return 0;
        };
        var isValvePresent = function (valveIndex, loadCenterValveData) {
            if (valveIndex < 2) {
                return true;
            }
            else {
                return msg.isBitSet(loadCenterValveData, valveIndex);
            }
        };
        var deviceIDToString = function (poolConfig) {
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
                    return "fix: poolConfig ".concat(poolConfig);
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
        var loadSpeedCircuits = function (speedDataArray, isPool) {
            // let  loadSpeedCircuits(poolConfig,isPool) {
            // ArrayList<Pair<String, Integer>> result = new ArrayList<>();
            var result = new Array();
            // Pair<Integer, Integer> minMax = getRange(poolConfig, isPool);
            var minMax = [0, 255];
            // int iMin = ((Integer) minMax.first).intValue();
            // int iMax = ((Integer) minMax.second).intValue();
            var iMin = minMax[0];
            var iMax = minMax[1];
            var iCount = 0;
            for (var i = iMin; i < iMax; i++) {
                // let byCircuit = poolConfig.getEquipconfig().getSpeedDataArray().get(i);
                var byCircuit = speedDataArray[i];
                if (byCircuit.byteValue() > 0) {
                    if (byCircuit.byteValue() >= 128 && byCircuit.byteValue() <= 132) {
                        // let name = get().deviceIDToString(poolConfig, byCircuit.byteValue());
                        var name_1 = "string ".concat(byCircuit);
                        var id = byCircuit.byteValue();
                        result.push([name_1, id]);
                        iCount++;
                    }
                    else {
                        var circuit = byCircuit;
                        if (circuit != null) {
                            var name2 = circuit.getM_Name();
                            var id2 = byCircuit.byteValue();
                            result.push([name2, id2]);
                            iCount++;
                        }
                    }
                }
            }
            if (iCount < iMax - iMin) {
            }
            return result;
        };
        var getRange = function () {
            var ret = { min: 0, max: 0 };
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
        var controllerType = msg.readUInt8();
        var hardwareType = msg.readUInt8();
        msg.readUInt8();
        msg.readUInt8();
        var controllerData = msg.readInt32LE();
        var versionDataArray = msg.readSLArray();
        var version = 0;
        var speedDataArray = msg.readSLArray();
        var valveDataArray = msg.readSLArray(); // decodeValveData()
        var remoteDataArray = msg.readSLArray();
        var heaterConfigDataArray = msg.readSLArray(); // decodeSensorData()
        var delayDataArray = msg.readSLArray(); // decodeDelayData()
        var macroDataArray = msg.readSLArray();
        var miscDataArray = msg.readSLArray(); // decodeMiscData()
        var lightDataArray = msg.readSLArray();
        var flowDataArray = msg.readSLArray();
        var sgDataArray = msg.readSLArray();
        var spaFlowDataArray = msg.readSLArray();
        var expansionsCount = (controllerData & 192) >> 6;
        if (versionDataArray === null || versionDataArray.length < 2) {
            version = 0;
        }
        else
            version = (versionDataArray[0] * 1000) + (versionDataArray[1]);
        var numPumps = getNumPumps();
        var pumps = [];
        for (var i = 0; i < numPumps; i++) {
            var pump = { id: i + 1 };
            pump.type = getPumpType(i);
        }
        // let sensors = msg.decodeHeaterConfigData(heaterConfigDataArray);
        ///// Heater config
        var heaterConfig = {
            body1SolarPresent: msg.isBitSet(heaterConfigDataArray[0], 1),
            body1HeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 4),
            // solarHeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 4),  // ?? bHPump1
            body2SolarPresent: msg.isBitSet(heaterConfigDataArray[0], 4),
            thermaFloPresent: msg.isBitSet(heaterConfigDataArray[2], 5),
            // body2HeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 5),  // bHPump2
            thermaFloCoolPresent: msg.isBitSet(heaterConfigDataArray[1], 1)
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
        for (var loadCenterIndex = 0; loadCenterIndex <= expansionsCount; loadCenterIndex++) {
            var loadCenterValveData = valveDataArray[loadCenterIndex];
            for (var valveIndex = 0; valveIndex < 5; valveIndex++) {
                var valveName = void 0;
                var loadCenterName = void 0;
                var deviceId = void 0;
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
                var bPresent = false;
                if (valveIndex < 2) {
                    bPresent = true;
                }
                else {
                    bPresent = isValvePresent(valveIndex, loadCenterValveData);
                }
                var sCircuit = void 0;
                if (bPresent) {
                    var valveDataIndex = (loadCenterIndex * 5) + 4 + valveIndex;
                    deviceId = valveDataArray[valveDataIndex];
                    sCircuit = deviceIDToString(deviceId);
                    valveName = String.fromCharCode(65 + valveIndex);
                    if (deviceId !== 0) {
                        sCircuit = 'Unused';
                        console.log('unused valve, loadCenterIndex = ' + loadCenterIndex + ' valveIndex = ' + valveIndex);
                        // } else if (isSolarValve === true) {
                        //   // console.log('used by solar');
                    }
                    else {
                        loadCenterName = (loadCenterIndex + 1).toString();
                    }
                    var v = {
                        loadCenterIndex: loadCenterIndex,
                        valveIndex: valveIndex,
                        valveName: valveName,
                        loadCenterName: loadCenterName,
                        deviceId: deviceId,
                        sCircuit: sCircuit
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
        var delays = {
            poolPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 0),
            spaPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 1),
            pumpOffDuringValveAction: msg.isBitSet(delayDataArray[0], 7)
        };
        ///// End Delays
        var misc = {
            intelliChem: msg.isBitSet(miscDataArray[3], 0),
            spaManualHeat: miscDataArray[4] !== 0
        };
        var speed = [];
        speed = loadSpeedCircuits(speedDataArray, true);
        var data = {
            // let data: SLEquipmentConfigurationData = {
            controllerType: controllerType,
            hardwareType: hardwareType,
            expansionsCount: expansionsCount,
            version: version,
            heaterConfig: heaterConfig,
            valves: valves,
            delays: delays,
            misc: misc,
            speed: speed
        };
        return data;
    };
    EquipmentStateMessage.decodeWeatherMessage = function (msg) {
        var version = msg.readInt32LE();
        var zip = msg.readSLString();
        var lastUpdate = msg.readSLDateTime();
        var lastRequest = msg.readSLDateTime();
        var dateText = msg.readSLString();
        var text = msg.readSLString();
        var currentTemperature = msg.readInt32LE();
        var humidity = msg.readInt32LE();
        var wind = msg.readSLString();
        var pressure = msg.readInt32LE();
        var dewPoint = msg.readInt32LE();
        var windChill = msg.readInt32LE();
        var visibility = msg.readInt32LE();
        var numDays = msg.readInt32LE();
        var dayData = new Array(numDays);
        for (var i = 0; i < numDays; i++) {
            dayData[i] = {
                dayTime: msg.readSLDateTime(),
                highTemp: msg.readInt32LE(),
                lowTemp: msg.readInt32LE(),
                text: msg.readSLString()
            };
        }
        var sunrise = msg.readInt32LE();
        var sunset = msg.readInt32LE();
        var data = {
            version: version,
            zip: zip,
            lastUpdate: lastUpdate,
            lastRequest: lastRequest,
            dateText: dateText,
            text: text,
            currentTemperature: currentTemperature,
            humidity: humidity,
            wind: wind,
            pressure: pressure,
            dewPoint: dewPoint,
            windChill: windChill,
            visibility: visibility,
            dayData: dayData,
            sunrise: sunrise,
            sunset: sunset
        };
        return data;
    };
    EquipmentStateMessage.decodeGetHistory = function (msg) {
        var readTimeTempPointsPairs = function () {
            var retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                var points = msg.readInt32LE();
                // 16 bytes per time, 4 bytes per temperature
                if (msg.length >= msg.readOffset + (points * (16 + 4))) {
                    for (var i = 0; i < points; i++) {
                        var time = msg.readSLDateTime();
                        var temp = msg.readInt32LE();
                        retval.push({
                            time: time,
                            temp: temp
                        });
                    }
                }
            }
            return retval;
        };
        var readTimeTimePointsPairs = function () {
            var retval = [];
            // 4 bytes for the length
            if (msg.length >= msg.readOffset + 4) {
                var points = msg.readInt32LE();
                // 16 bytes per on time, 16 bytes per off time
                if (msg.length >= msg.readOffset + (points * (16 + 16))) {
                    for (var i = 0; i < points; i++) {
                        var onTime = msg.readSLDateTime();
                        var offTime = msg.readSLDateTime();
                        retval.push({
                            on: onTime,
                            off: offTime
                        });
                    }
                }
            }
            return retval;
        };
        var airTemps = readTimeTempPointsPairs();
        var poolTemps = readTimeTempPointsPairs();
        var poolSetPointTemps = readTimeTempPointsPairs();
        var spaTemps = readTimeTempPointsPairs();
        var spaSetPointTemps = readTimeTempPointsPairs();
        var poolRuns = readTimeTimePointsPairs();
        var spaRuns = readTimeTimePointsPairs();
        var solarRuns = readTimeTimePointsPairs();
        var heaterRuns = readTimeTimePointsPairs();
        var lightRuns = readTimeTimePointsPairs();
        var data = {
            airTemps: airTemps,
            poolTemps: poolTemps,
            poolSetPointTemps: poolSetPointTemps,
            spaTemps: spaTemps,
            spaSetPointTemps: spaSetPointTemps,
            poolRuns: poolRuns,
            spaRuns: spaRuns,
            solarRuns: solarRuns,
            heaterRuns: heaterRuns,
            lightRuns: lightRuns
        };
        return data;
    };
    EquipmentStateMessage.prototype.getCircuitName = function (poolConfig, circuitIndex) {
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
        return (circuitIndex <= 0 || circuitIndex >= 5) ? this.isEasyTouch(poolConfig) ? circuitIndex <= 9 ? "Aux ".concat(circuitIndex - 1) : circuitIndex <= 17 ? "Feature ".concat(circuitIndex - 9) : circuitIndex == 19 ? "Aux Extra" : "error ".concat(circuitIndex) : circuitIndex < 40 ? "Aux ".concat(circuitIndex - 1) : "Feature ".concat(circuitIndex - 39) : "Aux ".concat(circuitIndex);
    };
    return EquipmentStateMessage;
}());
exports.EquipmentStateMessage = EquipmentStateMessage;
