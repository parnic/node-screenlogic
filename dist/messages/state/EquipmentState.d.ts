import { Inbound, SLData, SLSimpleBoolData } from '../SLMessage';
import { Delays, Misc, SLCircuitIdName, SLHistoryData, SLWeatherForecastData, Valves } from '../config/EquipmentConfig';
export declare class EquipmentStateMessage {
    static decodeEquipmentStateResponse(msg: Inbound): SLEquipmentStateData;
    static decodeSystemTime(msg: Inbound): SLSystemTimeData;
    static decodeCancelDelay(msg: Inbound): SLSimpleBoolData;
    static decodeSetSystemTime(msg: Inbound): SLSimpleBoolData;
    static decodeEquipmentConfiguration(msg: Inbound): {
        controllerType: number;
        hardwareType: number;
        expansionsCount: number;
        version: number;
        heaterConfig: {
            body1SolarPresent: boolean;
            body1HeatPumpPresent: boolean;
            body2SolarPresent: boolean;
            thermaFloPresent: boolean;
            thermaFloCoolPresent: boolean;
        };
        valves: Valves[];
        delays: Delays;
        misc: Misc;
        speed: SLCircuitIdName[];
    };
    static decodeWeatherMessage(msg: Inbound): SLWeatherForecastData;
    static decodeGetHistory(msg: Inbound): SLHistoryData;
    static decodeGeneric(msg: Inbound): void;
}
export declare namespace EquipmentStateMessage {
    enum ResponseIDs {
        SystemTime = 8111,
        SetSystemTime = 8113,
        AsyncEquipmentState = 12500,
        EquipmentState = 12527,
        CancelDelay = 12581
    }
}
export interface SLEquipmentStateData extends SLData {
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
    year: number;
    month: number;
    dayOfWeek: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
    adjustForDST: boolean;
}
