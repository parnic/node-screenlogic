import { PumpTypes } from "../../index";
import { Inbound } from "../SLMessage";


export class PumpMessage {
  public static decodePumpStatus(msg: Inbound){
    let pumpType = msg.readUInt32LE();
    let isRunning = msg.readUInt32LE() !== 0; // 0, 1, or 4294967295 (FF FF FF FF)
    let pumpWatts = msg.readUInt32LE();
    let pumpRPMs = msg.readUInt32LE();
    let pumpUnknown1 = msg.readUInt32LE(); // Always 0
    let pumpGPMs = msg.readUInt32LE();
    let pumpUnknown2 = msg.readUInt32LE(); // Always 255

    let pumpCircuits = [];
    for (var i = 0; i < 8; i++) {
      let _pumpCirc: SLPumpCircuitData = {
        circuitId: msg.readUInt32LE(),
        speed: msg.readUInt32LE(),
        isRPMs: msg.readUInt32LE() !== 0 // 1 for RPMs; 0 for GPMs
      };
      pumpCircuits.push(_pumpCirc);
    }
    let data: SLPumpStatusData = {
      pumpCircuits,
      pumpType,
      isRunning,
      pumpWatts,
      pumpRPMs,
      pumpUnknown1,
      pumpGPMs,
      pumpUnknown2
    };
    return data;
  }
  public static decodeSetPumpSpeed(msg:Inbound){
    // ack
    return true;
  }
}

export interface SLPumpStatusData {
  pumpCircuits: SLPumpCircuitData[];
  pumpType: PumpTypes;
  isRunning: boolean;
  pumpWatts: number;
  pumpRPMs: number;
  pumpUnknown1: number;
  pumpGPMs: number;
  pumpUnknown2: number;
}

export interface SLPumpCircuitData {
    circuitId: number;
    speed: number;
    isRPMs: boolean;
  }