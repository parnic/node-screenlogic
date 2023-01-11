
import { PumpTypes } from "../../index";
import { Inbound } from "../SLMessage";
import { Delays, Misc, SLHistoryData, SLWeatherForecastData, SLWeatherForecastDayData, TimeTempPointPairs, TimeTimePointPairs, Valves } from "../config/EquipmentConfig";


export class EquipmentStateMessage {
   public static decodeEquipmentStateResponse(msg: Inbound) {
    let data: SLEquipmentStateData;
    let panelMode = msg.readInt32LE();
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
    let circuitArray:SLEquipmentCircuitArrayState[] = new Array(circuitCount);
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
      panelMode,
      freezeMode,
      remotes,
      poolDelay,
      spaDelay,
      cleanerDelay,
      airTemp,
      bodiesCount,
      bodies,
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
  } 
  
  public static decodeSystemTime(msg: Inbound) {
    let date = msg.readSLDateTime();
    let year = date.getFullYear();
    let month = date.getMonth() + 1; // + 1 is for backward compatibility, SLTime represents months as 1-based
    let dayOfWeek = date.getDay(); // should probably be tweaked to adjust what days are 0-6 as SLTime and Javascript start on different days of the week
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    let millisecond = date.getMilliseconds();
    var adjustForDST = msg.readInt32LE() === 1;
    let data: SLSystemTimeData = {
      date,
      year,
      month,
      dayOfWeek,
      day,
      hour,
      minute,
      second,
      millisecond,
      adjustForDST
    }
    return data;
  }
  public static decodeCancelDelay(msg: Inbound) {
    // ack
    return true;
  }
  public static decodeSetSystemTime(msg: Inbound) {
    // ack
    return true;
  }
  public static decodeEquipmentConfiguration(msg: Inbound) {
    let getNumPumps = function () {
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
    let getPumpType = function (pumpIndex) {
      if (typeof (pumpIndex) !== 'number') {
        return 0;
      }

      if (flowDataArray === null || flowDataArray.length < (pumpIndex + 1) * 45) {
        return 0;
      }

      let pumpType = flowDataArray[(45 * pumpIndex) + 2];
      if (pumpType <= 3) {
        return pumpType as PumpTypes;
      }

      return 0;
    }
    let isValvePresent = function (valveIndex, loadCenterValveData) {
      if (valveIndex < 2) {
        return true;
      } else {
        return msg.isBitSet(loadCenterValveData, valveIndex);
      }
    }
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
    let loadSpeedCircuits = (speedDataArray, isPool)=> {
      // let  loadSpeedCircuits(poolConfig,isPool) {
      // ArrayList<Pair<String, Integer>> result = new ArrayList<>();
      let result = new Array();
      // Pair<Integer, Integer> minMax = getRange(poolConfig, isPool);
      let minMax = [0, 255];
      // int iMin = ((Integer) minMax.first).intValue();
      // int iMax = ((Integer) minMax.second).intValue();
      let iMin = minMax[0];
      let iMax = minMax[1];
      let iCount = 0;
      for (let i = iMin; i < iMax; i++) {
        // let byCircuit = poolConfig.getEquipconfig().getSpeedDataArray().get(i);
        let byCircuit = speedDataArray[i];
        if (byCircuit.byteValue() > 0) {
          if (byCircuit.byteValue() >= 128 && byCircuit.byteValue() <= 132) {
            // let name = get().deviceIDToString(poolConfig, byCircuit.byteValue());
            let name = `string ${byCircuit}`
            let id = byCircuit.byteValue();
            result.push([name, id]);
            iCount++;
          } else {
            let circuit = byCircuit;
            if (circuit != null) {
              let name2 = circuit.getM_Name();
              let id2 = byCircuit.byteValue();
              result.push([name2, id2]);
              iCount++;
            }
          }
        }
      }
      if (iCount < iMax - iMin) {
      }
      return result;
    }
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

    let expansionsCount = (controllerData & 192) >> 6;
    if (versionDataArray === null || versionDataArray.length < 2) {
      version = 0;
    }
    else version = (versionDataArray[0] * 1000) + (versionDataArray[1]);
    let numPumps = getNumPumps();

    let pumps = [];
    for (let i = 0; i < numPumps; i++) {
      let pump: any = { id: i + 1 };
      pump.type = getPumpType(i);
    }

    // let sensors = msg.decodeHeaterConfigData(heaterConfigDataArray);

    ///// Heater config
    let heaterConfig: any = {
      body1SolarPresent: msg.isBitSet(heaterConfigDataArray[0], 1), // bSolar1
      body1HeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 4), // bHPump1
      // solarHeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 4),  // ?? bHPump1
      body2SolarPresent: msg.isBitSet(heaterConfigDataArray[0], 4),  // bSolar2
      thermaFloPresent: msg.isBitSet(heaterConfigDataArray[2], 5), // bHPump2
      // body2HeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 5),  // bHPump2
      thermaFloCoolPresent: msg.isBitSet(heaterConfigDataArray[1], 1),  // ?? Source?
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

    var valves: Valves[] = [];

    for (let loadCenterIndex = 0; loadCenterIndex <= expansionsCount; loadCenterIndex++) {
      let loadCenterValveData = valveDataArray[loadCenterIndex];

      for (var valveIndex = 0; valveIndex < 5; valveIndex++) {
        let valveName: string;
        let loadCenterName: string;
        let deviceId: number;

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
          bPresent = isValvePresent(valveIndex, loadCenterValveData)
        }
        let sCircuit: string;
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
          } else {
            loadCenterName = (loadCenterIndex + 1).toString();
          }
          let v: any = {
            loadCenterIndex,
            valveIndex,
            valveName,
            loadCenterName,
            deviceId: deviceId,
            sCircuit
          }
          valves.push(v);
        }
        // }

      }

    }
    // msg.valves = valveArray;

    ///// End Valve decode

    ///// Delays
    let delays = {
      poolPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 0),
      spaPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 1),
      pumpOffDuringValveAction: msg.isBitSet(delayDataArray[0], 7)
    } as Delays;
    ///// End Delays
    let misc = {
      intelliChem: msg.isBitSet(miscDataArray[3], 0),
      manualHeat: miscDataArray[4] !== 0
    } as Misc;
    let speed : any[] = [];
    speed = loadSpeedCircuits(speedDataArray, true);
    let data: any = {
    // let data: SLEquipmentConfigurationData = {
      controllerType,
      hardwareType,
      expansionsCount,
      version,

      heaterConfig,
      valves,
      delays,
      misc,
      speed
    };
    return data;

  }



  public static decodeWeatherMessage(msg: Inbound) {
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
    let dayData: SLWeatherForecastDayData[] = new Array(numDays);
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
    let data: SLWeatherForecastData = {
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
  public static decodeGetHistory(msg: Inbound) {
    let readTimeTempPointsPairs = function () {
      let retval: TimeTempPointPairs[] = [];
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
    }
    let readTimeTimePointsPairs = function () {
      let retval: TimeTimePointPairs[] = [];
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
    }
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
    let data: SLHistoryData = {
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
  public static decodeGeneric(msg: Inbound){
    console.log(`Possible unknown string: ${msg.toString()}`);
  }
}

export interface SLEquipmentStateData {
  panelMode: number;
  freezeMode: number;
  remotes: number;
  poolDelay: number;
  spaDelay: number;
  cleanerDelay: number;
  airTemp: number;
  bodiesCount: number;
  bodies: SLEquipmentBodyState[],
  circuitArray: SLEquipmentCircuitArrayState[];
  pH: number;
  orp: number;
  saturation: number;
  saltPPM: number;
  pHTank: number;
  orpTank: number;
  alarms: number;
}
export interface SLEquipmentBodyState {
  currentTemp: number,
  heatStatus: number,
  setPoint: number,
  coolSetPoint: number,
  heatMode: number
}
export interface SLEquipmentCircuitArrayState {
  id: number,
  state: number,
  colorSet: number,
  colorPos: number,
  colorStagger: number,
  delay: number
}

export interface SLSystemTimeData {
  date: Date;
  year: any;
  month: any;
  dayOfWeek: any;
  day: any;
  hour: any;
  minute: any;
  second: any;
  millisecond: any;
  adjustForDST: boolean;
}