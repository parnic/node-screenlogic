
import { Inbound, SLData, SLSimpleBoolData } from './SLMessage';


export class ConnectionMessage{
  public static decodeChallengeResponse(msg: Inbound): string {
    const challengeString = msg.readSLString();
    return challengeString;
  }
  public static decodeVersionResponse(msg: Inbound): SLVersionData {
    const version = msg.readSLString();
    const versionData: SLVersionData = {
      senderId: msg.senderId,
      version
    };
    return versionData;
  }
  public static decodeAddClient(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
  public static decodeRemoveClient(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
  public static decodePingClient(msg: Inbound): SLSimpleBoolData {
    // ack
    const response: SLSimpleBoolData = {
      senderId: msg.senderId,
      val: true
    };
    return response;
  }
}

export interface SLVersionData extends SLData {
  version: string
}
