import { Inbound } from "./SLMessage";
export declare class ConnectionMessage {
    static decodeChallengeResponse(msg: Inbound): string;
    static decodeVersionResponse(msg: Inbound): string;
    static decodeAddClient(msg: Inbound): boolean;
    static decodeRemoveClient(msg: Inbound): boolean;
    static decodePingClient(msg: Inbound): boolean;
}
