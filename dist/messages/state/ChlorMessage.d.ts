import { Inbound, SLData, SLSimpleBoolData } from '../SLMessage';
export declare class ChlorMessage {
    static decodeIntellichlorConfig(msg: Inbound): SLIntellichlorData;
    static decodeSetIntellichlorConfig(msg: Inbound): SLSimpleBoolData;
    static decodeSetEnableIntellichlorConfig(msg: Inbound): SLSimpleBoolData;
}
export declare namespace ChlorMessage {
    enum ResponseIDs {
        GetIntellichlorConfig = 12573,
        SetIntellichlorEnabled = 12575,
        SetIntellichlorConfig = 12577
    }
}
export interface SLIntellichlorData extends SLData {
    installed: boolean;
    status: number;
    poolSetPoint: number;
    spaSetPoint: number;
    salt: number;
    flags: number;
    superChlorTimer: number;
}
