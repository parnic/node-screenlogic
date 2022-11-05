import { Inbound } from "../SLMessage";
export declare class CircuitMessage {
    static decodeSetCircuitState(msg: Inbound): boolean;
    static decodeSetLight(msg: Inbound): boolean;
    static decodeSetCircuitRunTime(msg: Inbound): boolean;
}
