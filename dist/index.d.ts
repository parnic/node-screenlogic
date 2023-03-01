/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import 'source-map-support/register';
import * as dgram from 'dgram';
import * as net from 'net';
import { EventEmitter } from 'events';
import * as SLGateway from './messages/SLGatewayDataMessage';
import { BodyCommands, ChemCommands, ChlorCommands, CircuitCommands, ConnectionCommands, EquipmentCommands, PumpCommands, ScheduleCommands } from './messages/OutgoingMessages';
import { SLVersionData } from './messages/ConnectionMessage';
import { SLCircuitNamesData, SLControllerConfigData, SLEquipmentConfigurationData, SLHistoryData, SLWeatherForecastData } from './messages/config/EquipmentConfig';
import { SLIntellichlorData } from './messages/state/ChlorMessage';
import { SLChemData, SLChemHistory } from './messages/state/ChemMessage';
import { SLScheduleData } from './messages/config/ScheduleMessage';
import { SLPumpStatusData } from './messages/state/PumpMessage';
import { Inbound, SLMessage, SLSimpleBoolData, SLSimpleNumberData } from './messages/SLMessage';
import { SLEquipmentStateData, SLSystemTimeData } from './messages/state/EquipmentState';
export declare class FindUnits extends EventEmitter {
    constructor();
    private finder;
    private bound;
    private message;
    search(): void;
    searchAsync(): Promise<LocalUnit[]>;
    foundServer(msg: Buffer, remote: dgram.RemoteInfo): void;
    sendServerBroadcast(): void;
    close(): void;
}
export declare class RemoteLogin extends EventEmitter {
    constructor(systemName: string);
    systemName: string;
    private _client;
    private _gateway;
    connectAsync(): Promise<SLGateway.SLGateWayData>;
    closeAsync(): Promise<boolean>;
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
    static controllerType: number;
    static expansionsCount: number;
    protected _isMock: boolean;
    protected _hasAddedClient: boolean;
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
    initUnit(server: LocalUnit): void;
    private _initCommands;
    write(bytes: Buffer | string): void;
    readMockBytesAsString(hexStr: string): void;
    keepAliveAsync(): void;
    processData(msg: Buffer): void;
    toLogEmit(message: SLMessage, direction: string): void;
    closeAsync(): Promise<boolean>;
    connectAsync(): Promise<boolean>;
    loginAsync(challengeString: string, senderId?: number): Promise<unknown>;
    bytesRead(): number;
    bytesWritten(): number;
    status(): {
        destroyed: boolean;
        connecting: boolean;
        readyState: string;
        timeout?: undefined;
    } | {
        destroyed: boolean;
        connecting: boolean;
        timeout: number;
        readyState: net.SocketReadyState;
    };
    getVersionAsync(senderId?: number): Promise<SLVersionData>;
    addClientAsync(clientId?: number, senderId?: number): Promise<SLSimpleBoolData>;
    removeClientAsync(senderId?: number): Promise<SLSimpleBoolData>;
    pingServerAsync(senderId?: number): Promise<SLSimpleBoolData>;
    onClientMessage(msg: Inbound): void;
}
export declare const screenlogic: UnitConnection;
export declare class Equipment {
    setSystemTimeAsync(date: Date, shouldAdjustForDST: boolean, senderId?: number): Promise<SLSystemTimeData>;
    getWeatherForecastAsync(senderId?: number): Promise<SLWeatherForecastData>;
    getHistoryDataAsync(fromTime?: Date, toTime?: Date, senderId?: number): Promise<SLHistoryData>;
    getAllCircuitNamesAsync(senderId?: number): Promise<SLCircuitNamesData>;
    getNCircuitNamesAsync(senderId?: number): Promise<number>;
    getCircuitNamesAsync(size: number, senderId?: number): Promise<SLCircuitNamesData>;
    getCircuitDefinitionsAsync(senderId?: number): Promise<SLCircuitNamesData>;
    getEquipmentConfigurationAsync(senderId?: number): Promise<SLEquipmentConfigurationData>;
    cancelDelayAsync(senderId?: number): Promise<SLSimpleBoolData>;
    getSystemTimeAsync(senderId?: number): Promise<SLSystemTimeData>;
    getControllerConfigAsync(senderId?: number): Promise<SLControllerConfigData>;
    getEquipmentStateAsync(senderId?: number): Promise<SLEquipmentStateData>;
    getCustomNamesAsync(senderId?: number): Promise<string[]>;
    setCustomNameAsync(idx: number, name: string, senderId?: number): Promise<string[]>;
}
export declare class Circuit extends UnitConnection {
    sendLightCommandAsync(command: LightCommands, senderId?: number): Promise<SLSimpleBoolData>;
    setCircuitRuntimebyIdAsync(circuitId: number, runTime?: number, senderId?: number): Promise<SLSimpleBoolData>;
    setCircuitAsync(circuitId: number, nameIndex: number, circuitFunction: number, circuitInterface: number, freeze: boolean, colorPos: number, senderId?: number): Promise<SLSimpleBoolData>;
    setCircuitStateAsync(circuitId: number, circuitState: boolean, senderId?: number): Promise<SLSimpleBoolData>;
}
export declare class Body extends UnitConnection {
    setSetPointAsync(bodyIndex: BodyIndex, temperature: number, senderId?: number): Promise<SLSimpleBoolData>;
    setCoolSetPointAsync(bodyIndex: BodyIndex, temperature: number, senderId?: number): Promise<SLSimpleBoolData>;
    setHeatModeAsync(bodyIndex: BodyIndex, heatMode: HeatModes, senderId?: number): Promise<SLSimpleBoolData>;
}
export declare class Pump extends UnitConnection {
    setPumpSpeedAsync(pumpId: number, circuitId: number, speed: number, isRPMs?: boolean, senderId?: number): Promise<SLSimpleBoolData>;
    getPumpStatusAsync(pumpId: number, senderId?: number): Promise<SLPumpStatusData>;
}
export declare class Schedule extends UnitConnection {
    setScheduleEventByIdAsync(scheduleId: number, circuitId: number, startTime: number, stopTime: number, dayMask: number, flags: number, heatCmd: number, heatSetPoint: number, senderId?: number): Promise<SLSimpleBoolData>;
    addNewScheduleEventAsync(scheduleType: SchedTypes, senderId?: number): Promise<SLSimpleNumberData>;
    deleteScheduleEventByIdAsync(scheduleId: number, senderId?: number): Promise<SLSimpleBoolData>;
    getScheduleDataAsync(scheduleType: SchedTypes, senderId?: number): Promise<SLScheduleData[]>;
}
export declare class Chem extends UnitConnection {
    getChemHistoryDataAsync(fromTime?: Date, toTime?: Date, senderId?: number): Promise<SLChemHistory>;
    getChemicalDataAsync(senderId?: number): Promise<SLChemData>;
}
export declare class Chlor extends UnitConnection {
    setIntellichlorOutputAsync(poolOutput: number, spaOutput: number, senderId?: number): Promise<SLSimpleBoolData>;
    getIntellichlorConfigAsync(senderId?: number): Promise<SLIntellichlorData>;
    setIntellichlorIsActiveAsync(isActive: boolean, senderId?: number): Promise<SLSimpleBoolData>;
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
export interface LocalUnit {
    address: string;
    type: number;
    port: number;
    gatewayType: number;
    gatewaySubtype: number;
    gatewayName: string;
}
