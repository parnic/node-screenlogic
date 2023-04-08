
import { PumpTypes, UnitConnection } from '../../index';
import { Inbound, SLData, SLSimpleBoolData } from '../SLMessage';


export class EquipmentConfigurationMessage {
  public static decodeCircuitDefinitions(msg: Inbound): SLCircuitNamesData {
    const cnt = msg.readUInt32LE();
    const res: SLCircuitIdName[] = [];
    for (let i = 0; i < cnt; i++) {
      const id = msg.readUInt32LE();
      const circuitName = msg.readSLString();
      res.push({ id, circuitName });
    }
    const data: SLCircuitNamesData = {
      senderId: msg.senderId,
      circuits: res
    };
    return data;
  }
  public static decodeNCircuitNames(msg: Inbound): number {
    const cnt = msg.readUInt8();
    return cnt;
  }
  public static decodeCircuitNames(msg: Inbound): SLCircuitNamesData {
    const size = msg.readUInt32LE();
    const res: SLCircuitIdName[] = [];
    for (let id = 1; id <= size; id++) {
      const circuitName = msg.readSLString();
      const data: SLCircuitIdName = {
        id,
        circuitName
      };
      res.push(data);
    }
    const data: SLCircuitNamesData = {
      senderId: msg.senderId,
      circuits: res
    };
    return data;
  }

  public static decodeControllerConfig(msg: Inbound): SLControllerConfigData {
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
    const circuitArray: Circuit[] = new Array(circuitCount);
    for (let i = 0; i < circuitCount; i++) {
      circuitArray[i] = {
        circuitId: msg.readInt32LE() - 499,
        name: msg.readSLString(),
        nameIndex: msg.readUInt8(),
        function: msg.readUInt8(),
        interface: msg.readUInt8(), // where does this show in the interface?  0 = pool; 1 = spa; 2 = features; 5 = hide
        freeze: msg.readUInt8(), // 1 = on with freeze active; 0 = not on with freeze active
        colorSet: msg.readUInt8(),
        colorPos: msg.readUInt8(),
        colorStagger: msg.readUInt8(),
        deviceId: msg.readUInt8(), // always the same as circuitId - 499;
        eggTimer: msg.readUInt16LE(),
      };
      msg.incrementReadOffset(2);
    }
    for (let i = 0; i < circuitArray.length; i++) {
      // normalize to 1 based ids for default names; 100 based for custom names
      circuitArray[i].nameIndex = circuitArray[i].nameIndex < 101 ? circuitArray[i].nameIndex + 1 : circuitArray[i].nameIndex + 99;
    }

    const colorCount = msg.readInt32LE();
    const colorArray: SLNameColor[] = new Array(colorCount);
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
    const pumpCircArray: number[] = new Array(pumpCircCount);
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
    const data: SLControllerConfigData = {
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

  public static isEasyTouch(controllerType: number): boolean {
    return controllerType === 14 || controllerType === 13;
  }

  public static isIntelliTouch(controllerType: number): boolean {
    return controllerType !== 14 && controllerType !== 13 && controllerType !== 10;
  }

  public static isEasyTouchLite(controllerType: number, hwType: number): boolean {
    return controllerType === 13 && (hwType & 4) !== 0;
  }

  public static isDualBody(controllerType: number): boolean {
    return controllerType === 5;
  }

  public static isChem2(controllerType: number, hwType: number): boolean {
    return controllerType === 252 && hwType === 2;
  }
  public static decodeSetEquipmentConfigurationAck(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }

  public static decodeSetEquipmentConfiguration(msg: Inbound): SLSetEquipmentConfigurationData {

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

    const pumps: Pump[] = [];
    for (let i = 0; i < numPumps; i++) {
      const pump = this._getPumpData(i, pumpDataArray);
      pumps.push(pump);
    }

    const heaterConfig = this._loadHeaterData(heaterConfigDataArray, msg);
    const valves = this._loadValveData(valveDataArray, heaterConfig, UnitConnection.controllerType, UnitConnection.expansionsCount, msg);
    const highSpeedCircuits = this._loadSpeedData(speedDataArray, UnitConnection.controllerType);
    const delays = this._loadDelayData(delayDataArray, msg);
    const lights = this._loadLightData(lightDataArray);
    const misc = this._loadMiscData(miscDataArray, msg);
    const remotes = this._loadRemoteData(remoteDataArray, UnitConnection.controllerType);
    const data: SLSetEquipmentConfigurationData = {
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

  private static _getNumPumps(pumpDataArray: number[]): number {
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

  private static _getPumpData(pumpIndex: number, pumpDataArray: number[]): Pump {
    const pumpIndexByte = 45 * pumpIndex;

    if (pumpDataArray === null || pumpDataArray.length < (pumpIndex + 1) * 45) {
      return null;
    }
    const id = pumpIndex + 1;
    const type = pumpDataArray[pumpIndexByte];
    let pentairType: PumpTypes;
    let name;
    if ((type & 128) === 128) {
      pentairType = PumpTypes.PUMP_TYPE_INTELLIFLOVS;
      name = 'Intelliflo VS';
    } else if ((type & 134) === 134) {
      pentairType = PumpTypes.PUMP_TYPE_INTELLIFLOVS;
      name = 'Intelliflo VS Ultra Efficiency';
    } else if ((type & 169) === 169) {
      pentairType = PumpTypes.PUMP_TYPE_INTELLIFLOVS;
      name = 'Intelliflo VS+SVRS';
    } else if ((type & 64) === 64) {
      pentairType = PumpTypes.PUMP_TYPE_INTELLIFLOVSF;
      name = 'Intelliflo VSF';
    } else {
      pentairType = PumpTypes.PUMP_TYPE_INTELLIFLOVF;
      name = 'Intelliflo VF';
    }

    const address = pumpIndex + 95;
    const circuits: PumpCircuit[] = [];
    let primingSpeed, primingTime, minSpeed, maxSpeed, speedStepSize;
    let backgroundCircuit,filterSize,turnovers,manualFilterGPM,minFlow,maxFlow,flowStepSize, maxSystemTime,maxPressureIncrease,backwashFlow,backwashTime,rinseTime,vacuumFlow,vacuumTime;
    if (pentairType === PumpTypes.PUMP_TYPE_INTELLIFLOVS) {
      for (let circuitId = 1; circuitId <= 8; circuitId++) {
        const _circuit = pumpDataArray[pumpIndexByte + (circuitId * 2 + 2)];
        if (_circuit !== 0) {
          const circuit: PumpCircuit = {
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
    } else if (pentairType === PumpTypes.PUMP_TYPE_INTELLIFLOVF) {
      for (let circuitId = 1; circuitId <= 8; circuitId++) {
        const _circuit = pumpDataArray[pumpIndexByte + (circuitId * 2 + 2)];
        if (_circuit !== 0) {
          const circuit: PumpCircuit = {
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
    } else if (pentairType === PumpTypes.PUMP_TYPE_INTELLIFLOVSF) {
      for (let circuitId = 1; circuitId <= 8; circuitId++) {
        const _circuit = pumpDataArray[pumpIndexByte + (circuitId * 2 + 2)];
        if (_circuit !== 0) {
          const circuit: PumpCircuit = {
            id: circuitId,
            circuit: _circuit,
            units: (pumpDataArray[pumpIndexByte + 3] >> circuitId - 1 & 1) === 0 ? 1 : 0
          };
          if (circuit.units) {
            circuit.flow = pumpDataArray[pumpIndexByte + (circuitId * 2 + 3)];
          } else {
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
    const pump: Pump = {
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

  private static _isValvePresent(valveIndex: number, loadCenterValveData: number, msg: Inbound): boolean {
    if (valveIndex < 2) {
      return true;
    } else {
      return msg.isBitSet(loadCenterValveData, valveIndex);
    }
  }

  private static _loadHeaterData(heaterConfigDataArray: number[], msg: Inbound): HeaterConfig {
    ///// Heater config
    const heaterConfig: HeaterConfig = {
      body1SolarPresent: msg.isBitSet(heaterConfigDataArray[0], 1), // bSolar1
      // body1HeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 4), // bHPump1
      solarHeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 4),  // ?? bHPump1
      body2SolarPresent: msg.isBitSet(heaterConfigDataArray[0], 4),  // bSolar2
      thermaFloPresent: msg.isBitSet(heaterConfigDataArray[2], 5), // bHPump2
      // body2HeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 5),  // bHPump2
      thermaFloCoolPresent: msg.isBitSet(heaterConfigDataArray[1], 1),  // ?? Source?
      units: msg.isBitSet(heaterConfigDataArray[2], 0) ? 1 : 0 // 1 == celsius, 0 = fahrenheit
    };

    return heaterConfig;
    ///// End heater config
  }

  private static _loadValveData(valveDataArray: number[], heaterConfig: HeaterConfig, controllerType: number, expansionsCount: number, msg: Inbound): Valves[] {
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

    const valves: Valves[] = [];

    for (let loadCenterIndex = 0; loadCenterIndex <= expansionsCount; loadCenterIndex++) {
      const loadCenterValveData = valveDataArray[loadCenterIndex];

      for (let valveIndex = 0; valveIndex < 5; valveIndex++) {
        let valveName: string;
        let loadCenterName: string;
        let deviceId: number;

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
          } else {
            loadCenterName = (loadCenterIndex + 1).toString();
          }
          const v: Valves = {
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
    return valves as Valves[];
  }

  private static _loadDelayData(delayDataArray: number[], msg: Inbound): Delays {
    const delays = {
      poolPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 0),
      spaPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 1),
      pumpOffDuringValveAction: msg.isBitSet(delayDataArray[0], 7)
    } as Delays;
    return delays;
  }

  private static _loadMiscData(miscDataArray: number[], msg: Inbound): Misc {
    const misc = {
      intelliChem: msg.isBitSet(miscDataArray[3], 0),
      manualHeat: msg.isBitSet(miscDataArray[4], 0)
    } as Misc;
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

  private static _loadSpeedData(speedDataArray: number[], controllerType: number): number[] {

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
    const speed: number[] = [];
    const range = getRange();
    for (let i = range.min; i < range.max; i++) {
      if (speedDataArray[i] !== 0) speed.push(speedDataArray[i]);
    }
    return speed;
  }

  private static _loadLightData(lightDataArray: number[]): Lights {
    const lights: Lights = {
      allOnAllOff: []
    };

    for (let i = 0; i < 8; i++) {
      lights.allOnAllOff.push(lightDataArray[i]);
    }

    return lights;
  }

  private static _loadRemoteData(remoteDataArray: number[], controllerType: number): SLRemoteData {
    const data: SLRemoteData = {
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

  private static _loadSpaFlowData(spaFlowDataArray: number[]): SpaFlow {
    const spaFlow: SpaFlow = {
      isActive: spaFlowDataArray[1] === 1,
      pumpId: spaFlowDataArray[5],
      stepSize: spaFlowDataArray[6]
    };
    return spaFlow;
  }

  public static decodeGetEquipmentConfiguration(msg: Inbound): SLEquipmentConfigurationData {


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
    const rawData: rawData = {
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
    UnitConnection.controllerType = controllerData;
    UnitConnection.expansionsCount = expansionsCount;
    if (versionDataArray === null || versionDataArray.length < 2) {
      version = 0;
    }

    else version = (versionDataArray[0] * 1000) + (versionDataArray[1]);
    const numPumps = this._getNumPumps(pumpDataArray);

    const pumps: Pump[] = [];
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
    const data: SLEquipmentConfigurationData = {
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

  public static decodeWeatherMessage(msg: Inbound): SLWeatherForecastData {
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
  public static decodeGetHistory(msg: Inbound): SLHistoryData {
    const readTimeTempPointsPairs = function (): TimeTempPointPairs[] {
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
    const readTimeTimePointsPairs = function (): TimeTimePointPairs[] {
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
  public getCircuitName(poolConfig: SLEquipmentConfigurationData, circuitIndex: number): string {
    if (poolConfig.controllerType === 3 || poolConfig.controllerType === 4) {
      if (circuitIndex == 0) {
        return 'Hight';
      }
      if (circuitIndex == 5) {
        return 'Low';
      }
    } else if (circuitIndex == 0) {
      return 'Spa';
    } else {
      if (circuitIndex == 5) {
        return 'Pool';
      }
    }
    return (circuitIndex <= 0 || circuitIndex >= 5) ? EquipmentConfigurationMessage.isEasyTouch(poolConfig.controllerType) ? circuitIndex <= 9 ? `Aux ${circuitIndex - 1}` : circuitIndex <= 17 ? `Feature ${circuitIndex - 9}` : circuitIndex == 19 ? 'Aux Extra' : `error ${circuitIndex}` : circuitIndex < 40 ? `Aux ${circuitIndex - 1}` : `Feature ${circuitIndex - 39}` : `Aux ${circuitIndex}`;
  }
  public static decodeCustomNames(msg: Inbound): SLGetCustomNamesData {
    const nameCount = msg.readInt32LE();
    // msg.incrementReadOffset(0);
    const customNames: string[] = [];
    // const ro = msg.readOffset;
    for (let i = 0; i < nameCount; i++) {
      const n = msg.readSLString();
      customNames.push(n);
    }
    const data: SLGetCustomNamesData = {
      senderId: msg.senderId,
      names: customNames
    };
    return data;
  }
  public static decodeSetCustomNameAck(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
  /* public  getTypeList(poolConfig: SLEquipmentConfigurationData, circuit: number) {
    let resultList = [];
    if (circuit.getM_Function() == 2) {
        CircuitType type = new CircuitType();
        type.setName(StringLib.string(R.string.Pool));
        type.setTypeID(2);
        resultList.add(type);
    }
    if (circuit.getM_Function() == 1) {
        CircuitType type2 = new CircuitType();
        type2.setName(StringLib.string(R.string.Spa));
        type2.setTypeID(1);
        resultList.add(type2);
    }
    ArrayList<CircuitType> tempList = poolConfig.getCircuitTypes();
    Iterator<CircuitType> it = tempList.iterator();
    while (it.hasNext()) {
        CircuitType type3 = it.next();
        boolean hasType = true;
        switch (type3.getTypeID()) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 6:
                hasType = false;
                break;
        }
        if (poolConfig.isEasyTouch()) {
            switch (type3.getTypeID()) {
                case 6:
                case 8:
                case 13:
                    hasType = false;
                    break;
                case 16:
                    if (poolConfig.getFWVersionNumeric() < 2010.0f && !poolConfig.iseasyTouchLite()) {
                        hasType = false;
                        break;
                    }
                    break;
                case 17:
                    if (poolConfig.getFWVersionNumeric() < 2060.0f && !poolConfig.iseasyTouchLite()) {
                        hasType = false;
                        break;
                    }
                    break;
            }
        }
        if (hasType) {
            resultList.add(type3);
        }
    }
    return resultList;
}*/
}

export namespace EquipmentConfigurationMessage { // eslint-disable-line @typescript-eslint/no-namespace
  export enum ResponseIDs {
    WeatherForecastChanged = 9806,
    WeatherForecastAck = 9808,
    GetHistoryData = 12502,
    GetCircuitDefinitions = 12511,
    GetControllerConfig = 12533,
    HistoryDataPending = 12535,
    NumCircuitNames = 12559,
    AsyncCircuitNames = 12560,
    GetCircuitNames = 12562,
    GetCustomNamesAck = 12563,
    SetCustomNameAck = 12565,
    GetEquipmentConfiguration = 12567,
    SetEquipmentConfiguration = 12568,
    SetEquipmentConfigurationAck = 12569,
  }
}

export interface SLControllerConfigData extends SLData {
  controllerId: number;
  minSetPoint: number[];
  maxSetPoint: number[];
  degC: boolean;
  controllerType: number;
  circuitCount: number,
  hwType: number;
  controllerData: number;
  equipment: Equipment;
  genCircuitName: string;
  interfaceTabFlags: number;
  circuitArray: Circuit[];
  colorCount: number;
  colorArray: SLNameColor[];
  pumpCircCount: number;
  pumpCircArray: number[];
  showAlarms: number;
}
export interface Equipment {
  POOL_SOLARPRESENT: boolean,
  POOL_SOLARHEATPUMP: boolean,
  POOL_CHLORPRESENT: boolean,
  POOL_IBRITEPRESENT: boolean,
  POOL_IFLOWPRESENT0: boolean,
  POOL_IFLOWPRESENT1: boolean,
  POOL_IFLOWPRESENT2: boolean,
  POOL_IFLOWPRESENT3: boolean,
  POOL_IFLOWPRESENT4: boolean,
  POOL_IFLOWPRESENT5: boolean,
  POOL_IFLOWPRESENT6: boolean,
  POOL_IFLOWPRESENT7: boolean,
  POOL_NO_SPECIAL_LIGHTS: boolean,
  POOL_HEATPUMPHASCOOL: boolean,
  POOL_MAGICSTREAMPRESENT: boolean,
  POOL_ICHEMPRESENT: boolean

}
export interface Circuit {
  circuitId: number,
  name: string,
  nameIndex: number,
  function: number,
  interface: number,
  freeze: number,
  colorSet?: number,
  colorPos?: number,
  colorStagger?: number,
  eggTimer: number,
  deviceId: number
}

export interface SLColor {
  r: number,
  g: number,
  b: number
}

export interface SLNameColor {
  name: string,
  color: SLColor
}

export interface SLSetEquipmentConfigurationData extends SLData {
  pumps: Pump[],
  heaterConfig: HeaterConfig,
  valves: Valves[],
  delays: Delays,
  misc: Misc,
  lights: Lights,
  highSpeedCircuits: number[],
  remotes: SLRemoteData,
  numPumps: number,
  // rawData
}

export interface SLEquipmentConfigurationData extends SLData {
  controllerType: number;
  hardwareType: number;
  expansionsCount: number;
  version: number;
  pumps: Pump[];
  heaterConfig: HeaterConfig;
  valves: Valves[];
  delays: Delays;
  misc: Misc;
  remotes: SLRemoteData;
  highSpeedCircuits: number[],
  lights: Lights,
  spaFlow: SpaFlow
  numPumps: number;
  rawData: rawData;
}

export interface SLRemoteData {
  fourButton: number[],
  tenButton: number[][],
  quickTouch: number[]
}

export interface rawData {
  versionData: number[],
  highSpeedCircuitData: number[],
  valveData: number[],
  remoteData: number[],
  heaterConfigData: number[],
  delayData: number[],
  macroData: number[],
  miscData: number[],
  lightData: number[],
  pumpData: number[],
  sgData: number[],
  spaFlowData: number[]
}

export interface PumpCircuit {
  id: number,
  circuit: number,
  speed?: number,
  flow?: number
  units: number,
}

export interface Pump {
  id: number,
  type: number,
  pentairType: PumpTypes,
  name: string,
  address: number,
  circuits: PumpCircuit[],
  primingSpeed: number,
  primingTime: number,
  minSpeed: number,
  maxSpeed: number,
  speedStepSize: number,
  backgroundCircuit: number,
  filterSize: number,
  turnovers: number,
  manualFilterGPM: number,
  minFlow: number,
  maxFlow: number,
  flowStepSize: number,
  maxSystemTime: number,
  maxPressureIncrease: number,
  backwashFlow: number,
  backwashTime: number,
  rinseTime: number,
  vacuumFlow: number,
  vacuumTime: number
}

export interface Lights {
  allOnAllOff: number[]
}

export interface SpaFlow {
  isActive: boolean,
  pumpId: number,
  stepSize: number
}

export interface HeaterConfig {
  body1SolarPresent: boolean,
  body2SolarPresent: boolean,
  thermaFloCoolPresent: boolean,
  solarHeatPumpPresent: boolean,
  thermaFloPresent: boolean,
  units: number
}

export interface Delays {
  poolPumpOnDuringHeaterCooldown: boolean,
  spaPumpOnDuringHeaterCooldown: boolean,
  pumpOffDuringValveAction: boolean
}

export interface Misc {
  intelliChem: boolean,
  manualHeat: boolean
}

export interface Valves {
  loadCenterIndex: number,
  valveIndex: number,
  valveName: string,
  loadCenterName: string,
  deviceId: number,
  sCircuit?: string
}

export interface SLWeatherForecastData extends SLData {
  version: number;
  zip: string;
  lastUpdate: Date;
  lastRequest: Date;
  dateText: string;
  text: string;
  currentTemperature: number;
  humidity: number;
  wind: string;
  pressure: number;
  dewPoint: number;
  windChill: number;
  visibility: number;
  dayData: SLWeatherForecastDayData[];
  sunrise: number;
  sunset: number;
}
export interface SLWeatherForecastDayData {
  dayTime: Date;
  highTemp: number;
  lowTemp: number;
  text: string;
}

export interface TimeTimePointPairs {
  on: Date;
  off: Date;
}
export interface TimeTempPointPairs {
  time: Date;
  temp: number;
}

export interface SLHistoryData extends SLData {
  airTemps: TimeTempPointPairs[];
  poolTemps: TimeTempPointPairs[];
  poolSetPointTemps: TimeTempPointPairs[];
  spaTemps: TimeTempPointPairs[];
  spaSetPointTemps: TimeTempPointPairs[];
  poolRuns: TimeTimePointPairs[];
  spaRuns: TimeTimePointPairs[];
  solarRuns: TimeTimePointPairs[];
  heaterRuns: TimeTimePointPairs[];
  lightRuns: TimeTimePointPairs[];
}

export interface SLCircuitIdName {
  id: number,
  circuitName: string
}

export interface SLCircuitNamesData extends SLData {
  circuits: SLCircuitIdName[]
}

export interface SLGetCustomNamesData extends SLData {
  names: string[]
}
