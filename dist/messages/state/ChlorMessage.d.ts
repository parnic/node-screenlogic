import { Inbound, SLData, SLSimpleBoolData } from '../SLMessage';
export declare class ChlorMessage {
    static decodeIntellichlorConfig(msg: Inbound): SLIntellichlorData;
    static decodeSetIntellichlorConfig(msg: Inbound): SLSimpleBoolData;
    static decodeSetEnableIntellichlorConfig(msg: Inbound): SLSimpleBoolData;
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
