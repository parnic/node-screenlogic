/// <reference types="node" />
import { Outbound } from './SLMessage';
import { LightCommands, UnitConnection } from '../index';
import { rawData } from './config/EquipmentConfig';
export declare class Commands extends Outbound {
    protected unit: UnitConnection;
    constructor(unit: UnitConnection, senderId?: number);
}
export declare class ConnectionCommands extends Commands {
    sendLoginMessage(password?: Buffer): this;
    sendChallengeMessage(): this;
    sendVersionMessage(): this;
    sendAddClientMessage(): this;
    sendRemoveClientMessage(): this;
    sendPingMessage(): this;
}
export declare class EquipmentCommands extends Commands {
    sendGetEquipmentStateMessage(): this;
    sendGetControllerConfigMessage(): this;
    sendGetNumCircuitNamesMessage(): this;
    sendGetCircuitNamesMessage(idx: any, cnt: any): this;
    sendGetCircuitDefinitionsMessage(): this;
    sendGetEquipmentConfigurationMessage(): this;
    sendSetEquipmentConfigurationMessageAsync(data: rawData): Promise<this>;
    sendGetSystemTimeMessage(): this;
    sendCancelDelayMessage(): this;
    sendGetCustomNamesMessage(): this;
    sendSetCustomNameMessage(idx: number, name: string): this;
    sendGetWeatherMessage(): this;
    sendSetSystemTimeMessage(date: Date, shouldAdjustForDST: boolean): this;
    sendGetHistoryMessage(fromTime: Date, toTime: Date): this;
}
export declare class CircuitCommands extends Commands {
    sendSetCircuitMessage(circuitId: number, nameIndex: number, circuitFunction: number, circuitInterface: number, freeze: boolean, colorPos: number): this;
    sendSetCircuitStateMessage(circuitId: number, circuitState: boolean): this;
    sendIntellibriteMessage(command: LightCommands): this;
    sendSetCircuitRuntimeMessage(circuitId: number, runTime: number): this;
}
export declare class ChlorCommands extends Commands {
    sendSetChlorOutputMessage(poolOutput: number, spaOutput: number): this;
    sendGetSaltCellConfigMessage(): this;
    sendSetSaltCellEnableMessage(isActive?: boolean): this;
}
export declare class ChemCommands extends Commands {
    sendGetChemStatusMessage(): this;
    sendGetChemHistoryMessage(fromTime: Date, toTime: Date): this;
}
export declare class BodyCommands extends Commands {
    sendSetPointMessage(bodyType: number, temperature: number): this;
    sendCoolSetPointMessage(bodyType: number, temperature: number): this;
    sendHeatModeMessage(bodyType: number, heatMode: number): this;
}
export declare class ScheduleCommands extends Commands {
    sendGetSchedulesMessage(schedType: number): this;
    sendAddScheduleEventMessage(schedType: number): this;
    sendDeleteScheduleEventMessage(schedId: number): this;
    sendSetScheduleEventMessage(scheduleId: number, circuitId: number, startTime: number, stopTime: number, dayMask: number, flags: number, heatCmd: number, heatSetPoint: number): this;
}
export declare class PumpCommands extends Commands {
    sendGetPumpStatusMessage(pumpId: number): this;
    sendSetPumpSpeed(pumpId: number, circuitId: number, speed: number, isRPMs?: boolean): this;
}
export declare class OutboundGateway extends Outbound {
    createSendGatewayMessage(systemName: string): Buffer;
}
