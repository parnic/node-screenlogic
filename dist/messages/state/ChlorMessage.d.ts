import { Inbound } from "../SLMessage";
export declare class ChlorMessage {
    static decodeIntellichlorConfig(msg: Inbound): SLIntellichlorData;
    static decodeSetIntellichlorConfig(msg: Inbound): boolean;
}
export interface SLIntellichlorData {
    installed: boolean;
    status: number;
    poolSetPoint: number;
    spaSetPoint: number;
    salt: number;
    flags: number;
    superChlorTimer: number;
}
