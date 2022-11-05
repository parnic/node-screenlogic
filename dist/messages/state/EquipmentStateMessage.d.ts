import { Inbound } from "../SLMessage";
export declare class EquipmentStateMessage {
    static decodeEquipmentStateResponse(msg: Inbound): SLEquipmentStateData;
    static decodeControllerConfig(msg: Inbound): SLControllerConfigData;
    static decodeSystemTime(msg: Inbound): SLSystemTimeData;
    static decodeCancelDelay(msg: Inbound): boolean;
    static decodeSetSystemTime(msg: Inbound): boolean;
    isEasyTouch(controllerType: any): boolean;
    isIntelliTouch(controllerType: any): boolean;
    isEasyTouchLite(controllerType: any, hwType: any): boolean;
    isDualBody(controllerType: any): boolean;
    isChem2(controllerType: any, hwType: any): boolean;
    static decodeEquipmentConfiguration(msg: Inbound): any;
    static decodeWeatherMessage(msg: Inbound): SLWeatherForecastData;
    static decodeGetHistory(msg: Inbound): SLHistoryData;
    getCircuitName(poolConfig: SLEquipmentConfigurationData, circuitIndex: number): string;
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
    bodies: {}[];
    currentTemp: any[];
    heatStatus: any[];
    setPoint: any[];
    coolSetPoint: any[];
    heatMode: any[];
    circuitArray: any[];
    pH: number;
    orp: number;
    saturation: number;
    saltPPM: number;
    pHTank: number;
    orpTank: number;
    alarms: number;
}
export interface SLControllerConfigData {
    controllerId: number;
    minSetPoint: number[];
    maxSetPoint: number[];
    degC: boolean;
    controllerType: any;
    circuitCount: number;
    hwType: any;
    controllerData: any;
    equipFlags: any;
    genCircuitName: any;
    interfaceTabFlags: number;
    bodyArray: any[];
    colorCount: number;
    colorArray: any[];
    pumpCircCount: number;
    pumpCircArray: any[];
    showAlarms: number;
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
export interface SLEquipmentConfigurationData {
    controllerType: number;
    hardwareType: number;
    expansionsCount: number;
    version: number;
    heaterConfig: HeaterConfig;
    valves: any[];
    delays: Delays;
    misc: Misc;
}
export interface HeaterConfig {
    body1SolarPresent: boolean;
    body2SolarPresent: boolean;
    thermaFloCoolPresent: boolean;
    solarHeatPumpPresent: boolean;
    thermaFloPresent: boolean;
}
export interface Delays {
    poolPumpOnDuringHeaterCooldown: boolean;
    spaPumpOnDuringHeaterCooldown: boolean;
    pumpOffDuringValveAction: any;
}
export interface Misc {
    intelliChem: boolean;
    spaManualHeat: boolean;
}
export interface Valves {
    loadCenterIndex: number;
    valveIndex: number;
    valveName: string;
    loadCenterName: string;
    deviceId: any;
}
export interface SLWeatherForecastData {
    version: number;
    zip: string;
    lastUpdate: Date;
    lastRequest: Date;
    dateText: string;
    text: string;
    currentTemperature: number;
    humidity: number;
    wind: string;
    pressure: number;
    dewPoint: number;
    windChill: number;
    visibility: number;
    dayData: SLWeatherForecastDayData[];
    sunrise: number;
    sunset: number;
}
export interface SLWeatherForecastDayData {
    dayTime: Date;
    highTemp: number;
    lowTemp: number;
    text: string;
}
export interface TimeTimePointPairs {
    on: Date;
    off: Date;
}
export interface TimeTempPointPairs {
    time: Date;
    temp: number;
}
export interface SLHistoryData {
    airTemps: TimeTempPointPairs[];
    poolTemps: TimeTempPointPairs[];
    poolSetPointTemps: TimeTempPointPairs[];
    spaTemps: TimeTempPointPairs[];
    spaSetPointTemps: TimeTempPointPairs[];
    poolRuns: TimeTimePointPairs[];
    spaRuns: TimeTimePointPairs[];
    solarRuns: TimeTimePointPairs[];
    heaterRuns: TimeTimePointPairs[];
    lightRuns: TimeTimePointPairs[];
}
