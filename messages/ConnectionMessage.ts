
import { Inbound } from './SLMessage';


export class ConnectionMessage{
  public static decodeChallengeResponse(msg: Inbound): string {
    const challengeString = msg.readSLString();
    return challengeString;
  }
  public static decodeVersionResponse(msg: Inbound): string {
    const version = msg.readSLString();
    return version;
  }
  public static decodeAddClient(msg: Inbound): boolean {
    // ack
    return true;
  }
  public static decodeRemoveClient(msg: Inbound): boolean {
    // ack
    return true;
  }
  public static decodePingClient(msg: Inbound): boolean {
    // ack
    return true;
  }
}
