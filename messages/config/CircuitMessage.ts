import { Inbound } from '../SLMessage';


export class CircuitMessage {
  public static decodeSetCircuit(msg: Inbound): boolean {
    return true;
  }

  public static decodeSetCircuitState(msg: Inbound): boolean {
    // ack
    return true;
  }
  public static decodeSetLight(msg: Inbound): boolean {
    // ack
    return true;
  }
  public static decodeSetCircuitRunTime(msg: Inbound): boolean {
    // ack
    return true;
  }
}
