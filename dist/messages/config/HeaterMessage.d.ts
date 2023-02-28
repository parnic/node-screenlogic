import { Inbound, SLSimpleBoolData } from '../SLMessage';
export declare class HeaterMessage {
    static decodeSetHeatSetPoint(msg: Inbound): SLSimpleBoolData;
    static decodeCoolSetHeatSetPoint(msg: Inbound): SLSimpleBoolData;
    static decodeSetHeatModePoint(msg: Inbound): SLSimpleBoolData;
}
