import { Inbound } from "../SLMessage";
import { SLHistoryData, SLSystemTimeData, SLWeatherForecastData } from "./EquipmentConfig";
export declare class EquipmentStateMessage {
    static decodeEquipmentStateResponse(msg: Inbound): SLEquipmentStateData;
    static decodeSystemTime(msg: Inbound): SLSystemTimeData;
    static decodeCancelDelay(msg: Inbound): boolean;
    static decodeSetSystemTime(msg: Inbound): boolean;
    static decodeEquipmentConfiguration(msg: Inbound): any;
    static decodeWeatherMessage(msg: Inbound): SLWeatherForecastData;
    static decodeGetHistory(msg: Inbound): SLHistoryData;
}
export interface SLEquipmentStateData {
    ok: number;
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
