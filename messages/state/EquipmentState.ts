
import { PumpTypes } from '../../index';
import { Inbound, SLData, SLSimpleBoolData } from '../SLMessage';
import { Delays, Misc, SLHistoryData, SLWeatherForecastData, SLWeatherForecastDayData, TimeTempPointPairs, TimeTimePointPairs, Valves } from '../config/EquipmentConfig';


export class EquipmentStateMessage {
  public static decodeEquipmentStateResponse(msg: Inbound) {
    const panelMode = msg.readInt32LE();
    const freezeMode = msg.readUInt8();
    const remotes = msg.readUInt8();
    const poolDelay = msg.readUInt8();
    const spaDelay = msg.readUInt8();
    const cleanerDelay = msg.readUInt8();
    msg.incrementReadOffset(3);
    const airTemp = msg.readInt32LE();
    let bodiesCount = msg.readInt32LE();
    if (bodiesCount > 2) {
      bodiesCount = 2;
    }

    const currentTemp = new Array(bodiesCount);
    const heatStatus = new Array(bodiesCount);
    const setPoint = new Array(bodiesCount);
    const coolSetPoint = new Array(bodiesCount);
    const heatMode = new Array(bodiesCount);

    const bodies = [{ id: 1, currentTemp: 0, heatStatus: 0, setPoint: 0, coolSetPoint: 0, heatMode: 0 }] as SLEquipmentBodyState[];
    if (bodiesCount > 1) bodies.push({ id: 2, currentTemp: 0, heatStatus: 0, setPoint: 0, coolSetPoint: 0, heatMode: 0 });

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

    const circuitCount = msg.readInt32LE();
    const circuitArray: SLEquipmentCircuitArrayState[] = new Array(circuitCount);
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

    const pH = msg.readInt32LE() / 100;
    const orp = msg.readInt32LE();
    const saturation = msg.readInt32LE() / 100;
    const saltPPM = msg.readInt32LE() * 50;
    const pHTank = msg.readInt32LE();
    const orpTank = msg.readInt32LE();
    const alarms = msg.readInt32LE();

    const data: SLEquipmentStateData = {
      senderId: msg.senderId,
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
    const date = msg.readSLDateTime();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // + 1 is for backward compatibility, SLTime represents months as 1-based
    const dayOfWeek = date.getDay(); // should probably be tweaked to adjust what days are 0-6 as SLTime and Javascript start on different days of the week
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const millisecond = date.getMilliseconds();
    const adjustForDST = msg.readInt32LE() === 1;
    const data: SLSystemTimeData = {
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
    };
    return data;
  }
  public static decodeCancelDelay(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
  public static decodeSetSystemTime(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
  public static decodeEquipmentConfiguration(msg: Inbound) {
    const getNumPumps = function () {
      if (flowDataArray === null) {
        return 0;
      }

      let numPumps = 0;
      for (let i = 0; i < flowDataArray.length; i += 45) {
        if (flowDataArray[i + 2] !== 0) {
          numPumps++;
        }
      }
      return numPumps;
    };
    const getPumpType = function (pumpIndex) {
      if (typeof (pumpIndex) !== 'number') {
        return 0;
      }

      if (flowDataArray === null || flowDataArray.length < (pumpIndex + 1) * 45) {
        return 0;
      }

      const pumpType = flowDataArray[(45 * pumpIndex) + 2];
      if (pumpType <= 3) {
        return pumpType as PumpTypes;
      }
      return 0;
    };
    const isValvePresent = function (valveIndex, loadCenterValveData) {
      if (valveIndex < 2) {
        return true;
      } else {
        return msg.isBitSet(loadCenterValveData, valveIndex);
      }
    };
    const deviceIDToString = (poolConfig) => {
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
    const loadSpeedCircuits = (speedDataArray, isPool) => {
      isPool;
      // let  loadSpeedCircuits(poolConfig,isPool) {
      // ArrayList<Pair<String, Integer>> result = new ArrayList<>();
      const result = [];
      // Pair<Integer, Integer> minMax = getRange(poolConfig, isPool);
      const minMax = [0, 255];
      // int iMin = ((Integer) minMax.first).intValue();
      // int iMax = ((Integer) minMax.second).intValue();
      const iMin = minMax[0];
      const iMax = minMax[1];
      let iCount = 0;
      for (let i = iMin; i < iMax; i++) {
        // let byCircuit = poolConfig.getEquipconfig().getSpeedDataArray().get(i);
        const byCircuit = speedDataArray[i];
        if (byCircuit.byteValue() > 0) {
          if (byCircuit.byteValue() >= 128 && byCircuit.byteValue() <= 132) {
            // let name = get().deviceIDToString(poolConfig, byCircuit.byteValue());
            const name = `string ${byCircuit}`;
            const id = byCircuit.byteValue();
            result.push([name, id]);
            iCount++;
          } else {
            const circuit = byCircuit;
            if (circuit != null) {
              const name2 = circuit.getM_Name();
              const id2 = byCircuit.byteValue();
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
    const controllerType = msg.readUInt8();
    const hardwareType = msg.readUInt8();
    msg.readUInt8();
    msg.readUInt8();
    const controllerData = msg.readInt32LE();
    const versionDataArray = msg.readSLArray();
    let version = 0;
    const speedDataArray = msg.readSLArray();
    const valveDataArray = msg.readSLArray(); // decodeValveData()
    // const remoteDataArray = msg.readSLArray();
    const heaterConfigDataArray = msg.readSLArray(); // decodeSensorData()
    const delayDataArray = msg.readSLArray(); // decodeDelayData()
    // const macroDataArray = msg.readSLArray();
    const miscDataArray = msg.readSLArray(); // decodeMiscData()
    // const lightDataArray = msg.readSLArray();
    const flowDataArray = msg.readSLArray();
    // const sgDataArray = msg.readSLArray();
    // const spaFlowDataArray = msg.readSLArray();

    const expansionsCount = (controllerData & 192) >> 6;
    if (versionDataArray === null || versionDataArray.length < 2) {
      version = 0;
    }
    else version = (versionDataArray[0] * 1000) + (versionDataArray[1]);
    const numPumps = getNumPumps();

    // const pumps = [];
    for (let i = 0; i < numPumps; i++) {
      const pump = { id: i + 1, type: 0 };
      pump.type = getPumpType(i);
    }

    // let sensors = msg.decodeHeaterConfigData(heaterConfigDataArray);

    ///// Heater config
    const heaterConfig = {
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
    let bEnable1 = true;
    let bEnable2 = true;
    // let isSolarValve0 = false;
    // let isSolarValve1 = false;
    if (heaterConfig.body1SolarPresent && !heaterConfig.body1HeatPumpPresent) {
      bEnable1 = false;
    }
    if (heaterConfig.body2SolarPresent && !heaterConfig.thermaFloPresent && controllerType === 5) {
      bEnable2 = false;
    }

    const valves: Valves[] = [];

    for (let loadCenterIndex = 0; loadCenterIndex <= expansionsCount; loadCenterIndex++) {
      const loadCenterValveData = valveDataArray[loadCenterIndex];

      for (let valveIndex = 0; valveIndex < 5; valveIndex++) {
        let valveName: string;
        let loadCenterName: string;
        let deviceId: number;

        let bEnable = true;
        // let isSolarValve = true;
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
        let sCircuit: string;
        if (bPresent) {
          const valveDataIndex = (loadCenterIndex * 5) + 4 + valveIndex;
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
          const v: any = {
            loadCenterIndex,
            valveIndex,
            valveName,
            loadCenterName,
            deviceId: deviceId,
            sCircuit
          };
          valves.push(v);
        }
        // }

      }

    }
    // msg.valves = valveArray;

    ///// End Valve decode

    ///// Delays
    const delays = {
      poolPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 0),
      spaPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 1),
      pumpOffDuringValveAction: msg.isBitSet(delayDataArray[0], 7)
    } as Delays;
    ///// End Delays
    const misc = {
      intelliChem: msg.isBitSet(miscDataArray[3], 0),
      manualHeat: miscDataArray[4] !== 0
    } as Misc;
    let speed: any[] = [];
    speed = loadSpeedCircuits(speedDataArray, true);
    const data: any = {
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
    const dayData: SLWeatherForecastDayData[] = new Array(numDays);
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
    const data: SLWeatherForecastData = {
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
  public static decodeGetHistory(msg: Inbound) {
    const readTimeTempPointsPairs = function () {
      const retval: TimeTempPointPairs[] = [];
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
      const retval: TimeTimePointPairs[] = [];
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
    const data: SLHistoryData = {
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
  public static decodeGeneric(msg: Inbound) {
    console.log(`Possible unknown string: ${msg.toString()}`);
  }
}

export interface SLEquipmentStateData extends SLData {
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
  id: number,
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