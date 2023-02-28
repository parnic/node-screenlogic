import { PumpTypes } from '../../index';
import { Inbound, SLData, SLSimpleBoolData } from '../SLMessage';
export declare class PumpMessage {
    static decodePumpStatus(msg: Inbound): SLPumpStatusData;
    static decodeSetPumpSpeed(msg: Inbound): SLSimpleBoolData;
}
export interface SLPumpStatusData extends SLData {
    pumpCircuits: SLPumpCircuitData[];
    pumpType: PumpTypes;
    isRunning: boolean;
    pumpWatts: number;
    pumpRPMs: number;
    pumpUnknown1: number;
    pumpGPMs: number;
    pumpUnknown2: number;
}
export interface SLPumpCircuitData {
    circuitId: number;
    speed: number;
    isRPMs: boolean;
}
