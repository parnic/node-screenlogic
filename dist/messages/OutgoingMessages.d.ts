/// <reference types="node" />
import { Outbound } from './SLMessage';
import { LightCommands, UnitConnection } from '../index';
import { rawData } from './config/EquipmentConfig';
export declare class Commands extends Outbound {
    protected unit: UnitConnection;
    constructor(unit: UnitConnection, senderId?: number);
}
export declare class ConnectionCommands extends Commands {
    sendLoginMessage(password?: Buffer, senderId?: number): ConnectionCommands;
    sendChallengeMessage(senderId?: number): ConnectionCommands;
    sendVersionMessage(senderId?: number): ConnectionCommands;
    sendAddClientMessage(senderId?: number): ConnectionCommands;
    sendRemoveClientMessage(senderId?: number): ConnectionCommands;
    sendPingMessage(senderId?: number): ConnectionCommands;
}
export declare class EquipmentCommands extends Commands {
    sendGetEquipmentStateMessage(senderId?: number): EquipmentCommands;
    sendGetControllerConfigMessage(senderId?: number): EquipmentCommands;
    sendGetNumCircuitNamesMessage(senderId?: number): EquipmentCommands;
    sendGetCircuitNamesMessage(idx: number, cnt: number, senderId?: number): EquipmentCommands;
    sendGetCircuitDefinitionsMessage(senderId?: number): EquipmentCommands;
    sendGetEquipmentConfigurationMessage(senderId?: number): EquipmentCommands;
    sendSetEquipmentConfigurationMessageAsync(data: rawData, senderId?: number): EquipmentCommands;
    sendGetSystemTimeMessage(senderId?: number): EquipmentCommands;
    sendCancelDelayMessage(senderId?: number): EquipmentCommands;
    sendGetCustomNamesMessage(senderId?: number): EquipmentCommands;
    sendSetCustomNameMessage(idx: number, name: string, senderId?: number): EquipmentCommands;
    sendGetWeatherMessage(senderId?: number): EquipmentCommands;
    sendSetSystemTimeMessage(date: Date, shouldAdjustForDST: boolean, senderId?: number): EquipmentCommands;
    sendGetHistoryMessage(fromTime: Date, toTime: Date, senderId?: number): EquipmentCommands;
}
export declare class CircuitCommands extends Commands {
    sendSetCircuitMessage(circuitId: number, nameIndex: number, circuitFunction: number, circuitInterface: number, freeze: boolean, colorPos: number, senderId?: number): CircuitCommands;
    sendSetCircuitStateMessage(circuitId: number, circuitState: boolean, senderId?: number): CircuitCommands;
    sendIntellibriteMessage(command: LightCommands, senderId?: number): CircuitCommands;
    sendSetCircuitRuntimeMessage(circuitId: number, runTime: number, senderId?: number): CircuitCommands;
}
export declare class ChlorCommands extends Commands {
    sendSetChlorOutputMessage(poolOutput: number, spaOutput: number, senderId?: number): ChlorCommands;
    sendGetSaltCellConfigMessage(senderId?: number): ChlorCommands;
    sendSetSaltCellEnableMessage(isActive?: boolean, senderId?: number): ChlorCommands;
}
export declare class ChemCommands extends Commands {
    sendGetChemStatusMessage(senderId?: number): ChemCommands;
    sendGetChemHistoryMessage(fromTime: Date, toTime: Date, senderId?: number): ChemCommands;
}
export declare class BodyCommands extends Commands {
    sendSetPointMessage(bodyType: number, temperature: number, senderId?: number): BodyCommands;
    sendCoolSetPointMessage(bodyType: number, temperature: number, senderId?: number): BodyCommands;
    sendHeatModeMessage(bodyType: number, heatMode: number, senderId?: number): BodyCommands;
}
export declare class ScheduleCommands extends Commands {
    sendGetSchedulesMessage(schedType: number, senderId?: number): ScheduleCommands;
    sendAddScheduleEventMessage(schedType: number, senderId?: number): ScheduleCommands;
    sendDeleteScheduleEventMessage(schedId: number, senderId?: number): ScheduleCommands;
    sendSetScheduleEventMessage(scheduleId: number, circuitId: number, startTime: number, stopTime: number, dayMask: number, flags: number, heatCmd: number, heatSetPoint: number, senderId?: number): ScheduleCommands;
}
export declare class PumpCommands extends Commands {
    sendGetPumpStatusMessage(pumpId: number, senderId?: number): PumpCommands;
    sendSetPumpSpeed(pumpId: number, circuitId: number, speed: number, isRPMs?: boolean, senderId?: number): PumpCommands;
}
export declare class OutboundGateway extends Outbound {
    createSendGatewayMessage(systemName: string, senderId?: number): Buffer;
}
