import { Inbound } from '../SLMessage';
export declare class CircuitMessage {
    static decodeSetCircuit(msg: Inbound): boolean;
    static decodeSetCircuitState(msg: Inbound): boolean;
    static decodeSetLight(msg: Inbound): boolean;
    static decodeSetCircuitRunTime(msg: Inbound): boolean;
}
