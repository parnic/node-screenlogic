import { Inbound } from '../SLMessage';
export declare class HeaterMessage {
    static decodeSetHeatSetPoint(msg: Inbound): boolean;
    static decodeCoolSetHeatSetPoint(msg: Inbound): boolean;
    static decodeSetHeatModePoint(msg: Inbound): boolean;
}
