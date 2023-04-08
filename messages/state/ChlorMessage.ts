import { Inbound, SLData, SLSimpleBoolData } from '../SLMessage';


export class ChlorMessage {
  public static decodeIntellichlorConfig(msg: Inbound){
    const data: SLIntellichlorData = {
      senderId: msg.senderId,
      installed: msg.readInt32LE() === 1,
      status: msg.readInt32LE(),
      poolSetPoint: msg.readInt32LE(),
      spaSetPoint: msg.readInt32LE(),
      salt: msg.readInt32LE() * 50,
      flags: msg.readInt32LE(),
      superChlorTimer: msg.readInt32LE()
    };
    return data;
  }
  public static decodeSetIntellichlorConfig(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
  public static decodeSetEnableIntellichlorConfig(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
}

export namespace ChlorMessage { // eslint-disable-line @typescript-eslint/no-namespace
  export enum ResponseIDs {
    GetIntellichlorConfig = 12573,
    SetIntellichlorEnabled = 12575,
    SetIntellichlorConfig = 12577,
  }
}

export interface SLIntellichlorData extends SLData {
  installed: boolean;
  status: number;
  poolSetPoint: number;
  spaSetPoint: number;
  salt: number;
  flags: number;
  superChlorTimer: number;
}