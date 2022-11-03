import { Inbound } from "../SLMessage"


export class ChlorMessage {
  public static decodeIntellichlorConfig(msg: Inbound){
    let data: SLIntellichlorData = {
      installed: msg.readInt32LE() === 1,
      status: msg.readInt32LE(),
      poolSetPoint: msg.readInt32LE(),
      spaSetPoint: msg.readInt32LE(),
      salt: msg.readInt32LE() * 50,
      flags: msg.readInt32LE(),
      superChlorTimer: msg.readInt32LE()
    }
    return data;
  }
  public static decodeSetIntellichlorConfig(msg: Inbound){
    // ack
    return true;
  }
}
export interface SLIntellichlorData {
  installed: boolean;
  status: number;
  poolSetPoint: number;
  spaSetPoint: number;
  salt: number;
  flags: number;
  superChlorTimer: number;
}