import { Inbound, SLData, SLSimpleBoolData } from './SLMessage';
export declare class ConnectionMessage {
    static decodeChallengeResponse(msg: Inbound): string;
    static decodeVersionResponse(msg: Inbound): SLVersionData;
    static decodeAddClient(msg: Inbound): SLSimpleBoolData;
    static decodeRemoveClient(msg: Inbound): SLSimpleBoolData;
    static decodePingClient(msg: Inbound): SLSimpleBoolData;
}
export declare namespace ConnectionMessage {
    enum ResponseIDs {
        LoginFailure = 13,
        Challenge = 15,
        Ping = 17,
        Login = 28,
        UnknownCommand = 30,
        BadParameter = 31,
        Version = 8121,
        AddClient = 12523,
        RemoveClient = 12525,
        GatewayResponse = 18004
    }
}
export interface SLVersionData extends SLData {
    version: string;
}
