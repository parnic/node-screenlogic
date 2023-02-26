import { Inbound } from '../SLMessage';

export class HeaterMessage {
  public static decodeSetHeatSetPoint(msg:Inbound){
    // ack
    return true;
  }
  public static decodeCoolSetHeatSetPoint(msg:Inbound){
    // ack
    return true;
  }
  public static decodeSetHeatModePoint(msg:Inbound){
    // ack
    return true;
  }
}