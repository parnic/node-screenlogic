import { Inbound, SLSimpleBoolData } from '../SLMessage';
export declare class CircuitMessage {
    static decodeSetCircuit(msg: Inbound): SLSimpleBoolData;
    static decodeSetCircuitState(msg: Inbound): SLSimpleBoolData;
    static decodeSetLight(msg: Inbound): SLSimpleBoolData;
    static decodeSetCircuitRunTime(msg: Inbound): SLSimpleBoolData;
}
