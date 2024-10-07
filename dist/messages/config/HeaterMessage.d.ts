import { Inbound, SLSimpleBoolData } from '../SLMessage';
export declare class HeaterMessage {
    static decodeSetHeatSetPoint(msg: Inbound): SLSimpleBoolData;
    static decodeCoolSetHeatSetPoint(msg: Inbound): SLSimpleBoolData;
    static decodeSetHeatModePoint(msg: Inbound): SLSimpleBoolData;
}
export declare namespace HeaterMessage {
    enum ResponseIDs {
        SetHeatSetPoint = 12529,
        SetHeatMode = 12539,
        SetCoolSetPoint = 12591
    }
}
