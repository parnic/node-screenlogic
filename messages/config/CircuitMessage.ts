import { Inbound, SLSimpleBoolData } from '../SLMessage';


export class CircuitMessage {
  public static decodeSetCircuit(msg: Inbound): SLSimpleBoolData {
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }

  public static decodeSetCircuitState(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
  public static decodeSetLight(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
  public static decodeSetCircuitRunTime(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
}
