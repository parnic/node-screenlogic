import { Inbound, SLSimpleBoolData } from '../SLMessage';

export class HeaterMessage {
  public static decodeSetHeatSetPoint(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
  public static decodeCoolSetHeatSetPoint(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
  public static decodeSetHeatModePoint(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
}

export namespace HeaterMessage { // eslint-disable-line @typescript-eslint/no-namespace
  export enum ResponseIDs {
    SetHeatSetPoint = 12529,
    SetHeatMode = 12539,
    SetCoolSetPoint = 12591,
  }
}
