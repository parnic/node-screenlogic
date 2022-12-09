import { Inbound } from "../SLMessage";


export class CircuitMessage {
  public static decodeSetCircuit(msg: Inbound){
    return true;
  }

  public static decodeSetCircuitState(msg: Inbound){
    // ack
    return true;
  }
  public static decodeSetLight(msg:Inbound){
    // ack
    return true;
  }
  public static decodeSetCircuitRunTime(msg:Inbound){
    // ack
    return true;
  }
}