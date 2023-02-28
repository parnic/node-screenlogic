import { Inbound, SLData, SLSimpleBoolData } from './SLMessage';
export declare class ConnectionMessage {
    static decodeChallengeResponse(msg: Inbound): string;
    static decodeVersionResponse(msg: Inbound): SLVersionData;
    static decodeAddClient(msg: Inbound): SLSimpleBoolData;
    static decodeRemoveClient(msg: Inbound): SLSimpleBoolData;
    static decodePingClient(msg: Inbound): SLSimpleBoolData;
}
export interface SLVersionData extends SLData {
    version: string;
}
