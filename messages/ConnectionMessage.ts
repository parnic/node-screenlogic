
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

export namespace ConnectionMessage { // eslint-disable-line @typescript-eslint/no-namespace
  export enum ResponseIDs {
    LoginFailure = 13,
    Challenge = 15,
    Ping = 17,
    Login = 28,
    UnknownCommand = 30,
    BadParameter = 31,
    Version = 8121,
    AddClient = 12523,
    RemoveClient = 12525,
    GatewayResponse = 18004,
  }
}

export interface SLVersionData extends SLData {
  version: string
}
