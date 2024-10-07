import { Inbound, SLData, SLSimpleBoolData, SLSimpleNumberData } from '../SLMessage';
export declare class ScheduleMessage {
    static decodeGetScheduleMessage(msg: Inbound): SLScheduleData;
    static decodeAddSchedule(msg: Inbound): SLSimpleNumberData;
    static decodeDeleteSchedule(msg: Inbound): SLSimpleBoolData;
    static decodeSetSchedule(msg: Inbound): SLSimpleBoolData;
}
export declare namespace ScheduleMessage {
    enum ResponseIDs {
        ScheduleChanged = 12501,
        GetSchedule = 12543,
        AddSchedule = 12545,
        DeleteSchedule = 12547,
        SetSchedule = 12549
    }
}
export interface SLScheduleDatum {
    scheduleId: number;
    circuitId: number;
    startTime: string;
    stopTime: string;
    dayMask: number;
    flags: number;
    heatCmd: number;
    heatSetPoint: number;
    days: string[];
}
export interface SLScheduleData extends SLData {
    data: SLScheduleDatum[];
}
