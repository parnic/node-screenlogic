/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import 'source-map-support/register';
import * as net from 'net';
import { EventEmitter } from 'events';
import * as SLGateway from './messages/SLGatewayDataMessage';
import { BodyCommands, ChemCommands, ChlorCommands, CircuitCommands, ConnectionCommands, EquipmentCommands, PumpCommands, ScheduleCommands } from './messages/OutgoingMessages';
import { SLControllerConfigData, SLEquipmentConfigurationData, SLHistoryData, SLSystemTimeData, SLWeatherForecastData } from './messages/state/EquipmentConfig';
import { SLIntellichlorData } from './messages/state/ChlorMessage';
import { SLChemData, SLChemHistory } from './messages/state/ChemMessage';
import { SLScheduleData } from './messages/state/ScheduleMessage';
import { SLPumpStatusData } from './messages/state/PumpMessage';
import { Inbound } from './messages/SLMessage';
import { SLEquipmentStateData } from './messages/state/EquipmentState';
export declare class FindUnits extends EventEmitter {
    constructor();
    private finder;
    private bound;
    private message;
    search(): void;
    searchAsync(): Promise<unknown>;
    foundServer(msg: any, remote: any): void;
    sendServerBroadcast(): void;
    close(): void;
}
export declare class RemoteLogin extends EventEmitter {
    constructor(systemName: any);
    systemName: string;
    private _client;
    private _gateway;
    connectAsync(): Promise<SLGateway.SLGateWayData>;
    closeAsync(): Promise<unknown>;
}
export declare class UnitConnection extends EventEmitter {
    constructor();
    systemName: string;
    private serverPort;
    private serverAddress;
    private password;
    protected client: net.Socket;
    private isConnected;
    private _clientId;
    get clientId(): number;
    set clientId(val: number);
    private _controllerId;
    get controllerId(): number;
    set controllerId(val: number);
    protected _isMock: boolean;
    private _buffer;
    private _bufferIdx;
    private _senderId;
    get senderId(): number;
    set senderId(val: number);
    controller: Controller;
    netTimeout: number;
    private _keepAliveDuration;
    private _keepAliveTimer;
    private _expectedMsgLen;
    circuits: Circuit;
    equipment: Equipment;
    bodies: Body;
    chem: Chem;
    chlor: Chlor;
    schedule: Schedule;
    pump: Pump;
    reconnectAsync: () => Promise<void>;
    initMock(systemName: string, address: string, port: number, password: string, senderId?: number): void;
    init(systemName: string, address: string, port: number, password: string, senderId?: number): void;
    private _initCommands;
    write(val: Buffer | string): void;
    keepAliveAsync(): void;
    processData(msg: Buffer): void;
    toLogEmit(message: any, dir: any): void;
    closeAsync(): Promise<boolean>;
    connectAsync(): Promise<boolean>;
    loginAsync(challengeString: string): Promise<unknown>;
    bytesRead(): number;
    bytesWritten(): number;
    status(): {
        destroyed: boolean;
        connecting: boolean;
        timeout: any;
        readyState: string;
    } | {
        destroyed: boolean;
        connecting: boolean;
        timeout: number;
        readyState: net.SocketReadyState;
    };
    getVersionAsync(): Promise<string>;
    addClientAsync(clientId?: number): Promise<boolean>;
    removeClientAsync(): Promise<boolean>;
    pingServerAsync(): Promise<boolean>;
    onClientMessage(msg: Inbound): void;
}
export declare let screenlogic: UnitConnection;
export declare class Equipment {
    setSystemTimeAsync(date: Date, shouldAdjustForDST: boolean): Promise<SLSystemTimeData>;
    getWeatherForecastAsync(): Promise<SLWeatherForecastData>;
    getHistoryDataAsync(fromTime?: Date, toTime?: Date): Promise<SLHistoryData>;
    getEquipmentConfigurationAsync(): Promise<SLEquipmentConfigurationData>;
    cancelDelayAsync(): Promise<boolean>;
    getSystemTimeAsync(): Promise<SLSystemTimeData>;
    getControllerConfigAsync(): Promise<SLControllerConfigData>;
    getEquipmentStateAsync(): Promise<SLEquipmentStateData>;
    getCustomNamesAsync(): Promise<string[]>;
}
export declare class Circuit extends UnitConnection {
    sendLightCommandAsync(command: LightCommands): Promise<boolean>;
    setCircuitRuntimebyIdAsync(circuitId: any, runTime: any): Promise<boolean>;
    setCircuitAsync(circuitId: number, nameIndex: number, circuitFunction: number, circuitInterface: number, freeze: boolean, colorPos: number): Promise<boolean>;
    setCircuitStateAsync(circuitId: number, circuitState: boolean): Promise<boolean>;
}
export declare class Body extends UnitConnection {
    setSetPointAsync(bodyIndex: BodyIndex, temperature: any): Promise<boolean>;
    setHeatModeAsync(bodyIndex: BodyIndex, heatMode: HeatModes): Promise<boolean>;
}
export declare class Pump extends UnitConnection {
    setPumpSpeedAsync(pumpId: number, circuitId: number, speed: number, isRPMs?: boolean): Promise<boolean>;
    getPumpStatusAsync(pumpId: any): Promise<SLPumpStatusData>;
}
export declare class Schedule extends UnitConnection {
    setScheduleEventByIdAsync(scheduleId: number, circuitId: number, startTime: number, stopTime: number, dayMask: number, flags: number, heatCmd: number, heatSetPoint: number): Promise<boolean>;
    addNewScheduleEventAsync(scheduleType: SchedTypes): Promise<number>;
    deleteScheduleEventByIdAsync(scheduleId: number): Promise<boolean>;
    getScheduleDataAsync(scheduleType: SchedTypes): Promise<SLScheduleData[]>;
}
export declare class Chem extends UnitConnection {
    getChemHistoryDataAsync(fromTime?: Date, toTime?: Date): Promise<SLChemHistory>;
    getChemicalDataAsync(): Promise<SLChemData>;
}
export declare class Chlor extends UnitConnection {
    setIntellichlorOutputAsync(poolOutput: number, spaOutput: number): Promise<boolean>;
    getIntellichlorConfigAsync(): Promise<SLIntellichlorData>;
}
export declare enum LightCommands {
    LIGHT_CMD_LIGHTS_OFF = 0,
    LIGHT_CMD_LIGHTS_ON = 1,
    LIGHT_CMD_COLOR_SET = 2,
    LIGHT_CMD_COLOR_SYNC = 3,
    LIGHT_CMD_COLOR_SWIM = 4,
    LIGHT_CMD_COLOR_MODE_PARTY = 5,
    LIGHT_CMD_COLOR_MODE_ROMANCE = 6,
    LIGHT_CMD_COLOR_MODE_CARIBBEAN = 7,
    LIGHT_CMD_COLOR_MODE_AMERICAN = 8,
    LIGHT_CMD_COLOR_MODE_SUNSET = 9,
    LIGHT_CMD_COLOR_MODE_ROYAL = 10,
    LIGHT_CMD_COLOR_SET_SAVE = 11,
    LIGHT_CMD_COLOR_SET_RECALL = 12,
    LIGHT_CMD_COLOR_BLUE = 13,
    LIGHT_CMD_COLOR_GREEN = 14,
    LIGHT_CMD_COLOR_RED = 15,
    LIGHT_CMD_COLOR_WHITE = 16,
    LIGHT_CMD_COLOR_PURPLE = 17
}
export declare enum HeatModes {
    HEAT_MODE_OFF = 0,
    HEAT_MODE_SOLAR = 1,
    HEAT_MODE_SOLARPREFERRED = 2,
    HEAT_MODE_HEATPUMP = 3,
    HEAT_MODE_HEATER = 3,
    HEAT_MODE_DONTCHANGE = 4
}
export declare enum PumpTypes {
    PUMP_TYPE_INTELLIFLOVF = 5,
    PUMP_TYPE_INTELLIFLOVS = 3,
    PUMP_TYPE_INTELLIFLOVSF = 4
}
export declare enum BodyIndex {
    POOL = 0,
    SPA = 1
}
export interface Controller {
    circuits: CircuitCommands;
    connection: ConnectionCommands;
    equipment: EquipmentCommands;
    chlor: ChlorCommands;
    chem: ChemCommands;
    schedules: ScheduleCommands;
    pumps: PumpCommands;
    bodies: BodyCommands;
}
export declare enum SchedTypes {
    RECURRING = 0,
    RUNONCE = 1
}
