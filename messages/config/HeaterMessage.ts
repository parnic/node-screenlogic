import { Inbound } from '../SLMessage';

export class HeaterMessage {
  public static decodeSetHeatSetPoint(msg: Inbound): boolean {
    // ack
    return true;
  }
  public static decodeCoolSetHeatSetPoint(msg: Inbound): boolean {
    // ack
    return true;
  }
  public static decodeSetHeatModePoint(msg: Inbound): boolean {
    // ack
    return true;
  }
}