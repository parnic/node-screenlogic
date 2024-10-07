import { Inbound, SLSimpleBoolData } from '../SLMessage';
export declare class CircuitMessage {
    static decodeSetCircuit(msg: Inbound): SLSimpleBoolData;
    static decodeSetCircuitState(msg: Inbound): SLSimpleBoolData;
    static decodeSetLight(msg: Inbound): SLSimpleBoolData;
    static decodeSetCircuitRunTime(msg: Inbound): SLSimpleBoolData;
}
export declare namespace CircuitMessage {
    enum ResponseIDs {
        LightSequence = 12504,
        SetCircuitInfo = 12521,
        SetCircuitState = 12531,
        SetCircuitRunTime = 12551,
        SetLightState = 12557
    }
}
