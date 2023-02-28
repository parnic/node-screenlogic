import { Inbound } from '../SLMessage';
import { SLHistoryData, SLWeatherForecastData } from '../config/EquipmentConfig';
export declare class EquipmentStateMessage {
    static decodeEquipmentStateResponse(msg: Inbound): SLEquipmentStateData;
    static decodeSystemTime(msg: Inbound): SLSystemTimeData;
    static decodeCancelDelay(msg: Inbound): boolean;
    static decodeSetSystemTime(msg: Inbound): boolean;
    static decodeEquipmentConfiguration(msg: Inbound): any;
    static decodeWeatherMessage(msg: Inbound): SLWeatherForecastData;
    static decodeGetHistory(msg: Inbound): SLHistoryData;
    static decodeGeneric(msg: Inbound): void;
}
export interface SLEquipmentStateData {
    panelMode: number;
    freezeMode: number;
    remotes: number;
    poolDelay: number;
    spaDelay: number;
    cleanerDelay: number;
    airTemp: number;
    bodiesCount: number;
    bodies: SLEquipmentBodyState[];
    circuitArray: SLEquipmentCircuitArrayState[];
    pH: number;
    orp: number;
    saturation: number;
    saltPPM: number;
    pHTank: number;
    orpTank: number;
    alarms: number;
}
export interface SLEquipmentBodyState {
    id: number;
    currentTemp: number;
    heatStatus: number;
    setPoint: number;
    coolSetPoint: number;
    heatMode: number;
}
export interface SLEquipmentCircuitArrayState {
    id: number;
    state: number;
    colorSet: number;
    colorPos: number;
    colorStagger: number;
    delay: number;
}
export interface SLSystemTimeData {
    date: Date;
    year: any;
    month: any;
    dayOfWeek: any;
    day: any;
    hour: any;
    minute: any;
    second: any;
    millisecond: any;
    adjustForDST: boolean;
}
