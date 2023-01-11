
import { Inbound } from "./SLMessage";


export class ConnectionMessage{
  public static decodeChallengeResponse(msg: Inbound){
    let challengeString = msg.readSLString();
    return challengeString;
  }
  public static decodeVersionResponse(msg: Inbound){
    let version = msg.readSLString();
    return version;
  }
  public static decodeAddClient(msg: Inbound){
    // ack
    return true;
  }
  public static decodeRemoveClient(msg: Inbound){
    // ack
    return true;
  }
  public static decodePingClient(msg: Inbound){
    // ack
    return true;
  }
}