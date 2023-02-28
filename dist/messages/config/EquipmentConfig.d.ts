import { Inbound, SLData, SLSimpleBoolData } from '../SLMessage';
export declare class EquipmentConfigurationMessage {
    static decodeCircuitDefinitions(msg: Inbound): any[];
    static decodeNCircuitNames(msg: Inbound): number;
    static decodeCircuitNames(msg: Inbound): SLCircuitNamesData;
    static decodeControllerConfig(msg: Inbound): SLControllerConfigData;
    static isEasyTouch(controllerType: number): boolean;
    static isIntelliTouch(controllerType: number): boolean;
    static isEasyTouchLite(controllerType: number, hwType: number): boolean;
    static isDualBody(controllerType: number): boolean;
    static isChem2(controllerType: number, hwType: number): boolean;
    static decodeSetEquipmentConfigurationAck(msg: Inbound): SLSimpleBoolData;
    static decodeSetEquipmentConfiguration(msg: Inbound): {
        senderId: number;
        pumps: any[];
        heaterConfig: HeaterConfig;
        valves: Valves[];
        delays: Delays;
        misc: Misc;
        lights: {
            allOnAllOff: any[];
        };
        highSpeedCircuits: number[];
        remotes: {
            fourButton: any[];
            tenButton: any[][];
            quickTouch: any[];
        };
        numPumps: number;
        rawData: {
            highSpeedCircuitData: any[];
            valveData: any[];
            remoteData: any[];
            heaterConfigData: any[];
            delayData: any[];
            macroData: any[];
            miscData: any[];
            lightData: any[];
            pumpData: any[];
            spaFlowData: any[];
            alarm: number;
        };
    };
    private static _getNumPumps;
    private static _getPumpData;
    private static _isValvePresent;
    private static _loadHeaterData;
    private static _loadValveData;
    private static _loadDelayData;
    private static _loadMiscData;
    private static _loadSpeedData;
    private static _loadLightData;
    private static _loadRemoteData;
    private static _loadSpaFlowData;
    static decodeGetEquipmentConfiguration(msg: Inbound): SLEquipmentConfigurationData;
    static decodeWeatherMessage(msg: Inbound): SLWeatherForecastData;
    static decodeGetHistory(msg: Inbound): SLHistoryData;
    getCircuitName(poolConfig: SLEquipmentConfigurationData, circuitIndex: number): string;
    static decodeCustomNames(msg: Inbound): string[];
    static decodeSetCustomNameAck(msg: Inbound): SLSimpleBoolData;
}
export interface SLControllerConfigData extends SLData {
    controllerId: number;
    minSetPoint: number[];
    maxSetPoint: number[];
    degC: boolean;
    controllerType: any;
    circuitCount: number;
    hwType: any;
    controllerData: any;
    equipment: Equipment;
    genCircuitName: any;
    interfaceTabFlags: number;
    circuitArray: Circuit[];
    colorCount: number;
    colorArray: any[];
    pumpCircCount: number;
    pumpCircArray: any[];
    showAlarms: number;
}
export interface Equipment {
    POOL_SOLARPRESENT: boolean;
    POOL_SOLARHEATPUMP: boolean;
    POOL_CHLORPRESENT: boolean;
    POOL_IBRITEPRESENT: boolean;
    POOL_IFLOWPRESENT0: boolean;
    POOL_IFLOWPRESENT1: boolean;
    POOL_IFLOWPRESENT2: boolean;
    POOL_IFLOWPRESENT3: boolean;
    POOL_IFLOWPRESENT4: boolean;
    POOL_IFLOWPRESENT5: boolean;
    POOL_IFLOWPRESENT6: boolean;
    POOL_IFLOWPRESENT7: boolean;
    POOL_NO_SPECIAL_LIGHTS: boolean;
    POOL_HEATPUMPHASCOOL: boolean;
    POOL_MAGICSTREAMPRESENT: boolean;
    POOL_ICHEMPRESENT: boolean;
}
export interface Circuit {
    circuitId: number;
    name: string;
    nameIndex: number;
    function: number;
    interface: number;
    freeze: number;
    colorSet?: number;
    colorPos?: number;
    colorStagger?: number;
    eggTimer: number;
    deviceId: number;
}
export interface SLEquipmentConfigurationData extends SLData {
    controllerType: number;
    hardwareType: number;
    expansionsCount: number;
    version: number;
    pumps: any;
    heaterConfig: HeaterConfig;
    valves: Valves[];
    delays: Delays;
    misc: Misc;
    remotes: SLRemoteData;
    highSpeedCircuits: any[];
    lights: {
        allOnAllOff: number[];
    };
    spaFlow: {
        isActive: boolean;
        pumpId: number;
        stepSize: number;
    };
    numPumps: number;
    rawData: rawData;
}
export interface SLRemoteData {
    fourButton: number[];
    tenButton: number[][];
    quickTouch: number[];
}
export interface rawData {
    versionData: number[];
    highSpeedCircuitData: number[];
    valveData: number[];
    remoteData: number[];
    heaterConfigData: number[];
    delayData: number[];
    macroData: number[];
    miscData: number[];
    lightData: number[];
    pumpData: number[];
    sgData: number[];
    spaFlowData: number[];
}
export interface HeaterConfig {
    body1SolarPresent: boolean;
    body2SolarPresent: boolean;
    thermaFloCoolPresent: boolean;
    solarHeatPumpPresent: boolean;
    thermaFloPresent: boolean;
    units: number;
}
export interface Delays {
    poolPumpOnDuringHeaterCooldown: boolean;
    spaPumpOnDuringHeaterCooldown: boolean;
    pumpOffDuringValveAction: any;
}
export interface Misc {
    intelliChem: boolean;
    manualHeat: boolean;
}
export interface Valves {
    loadCenterIndex: number;
    valveIndex: number;
    valveName: string;
    loadCenterName: string;
    deviceId: number;
    sCircuit: string;
}
export interface SLWeatherForecastData extends SLData {
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
export interface SLHistoryData extends SLData {
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
export interface SLCircuitIdName {
    id: number;
    circuitName: string;
}
export interface SLCircuitNamesData extends SLData {
    circuits: SLCircuitIdName[];
}
