import { Inbound } from '../SLMessage';
export declare class ScheduleMessage {
    static decodeGetScheduleMessage(msg: Inbound): SLScheduleData[];
    static decodeAddSchedule(msg: Inbound): number;
    static decodeDeleteSchedule(msg: Inbound): boolean;
    static decodeSetSchedule(msg: Inbound): boolean;
}
export interface SLScheduleData {
    scheduleId: number;
    circuitId: number;
    startTime: number;
    stopTime: number;
    dayMask: number;
    flags: number;
    heatCmd: number;
    heatSetPoint: number;
    days: number[];
}
