/// <reference types="node" />
import { Outbound } from "./SLMessage";
import { LightCommands, UnitConnection } from "../index";
export declare class Commands extends Outbound {
    protected unit: UnitConnection;
    constructor(unit: UnitConnection);
}
export declare class ConnectionCommands extends Commands {
    sendLoginMessage(password?: string[]): void;
    sendChallengeMessage(): void;
    sendVersionMessage(): void;
    sendAddClientMessage(): void;
    sendRemoveClientMessage(): void;
    sendPingMessage(): void;
}
export declare class EquipmentCommands extends Commands {
    sendGetEquipmentStateMessage(): void;
    sendGetControllerConfigMessage(): void;
    sendGetEquipmentConfigurationMessage(): void;
    sendGetSystemTimeMessage(): void;
    sendCancelDelayMessage(): void;
    sendGetCustomNamesMessage(): void;
    sendGetWeatherMessage(): void;
    sendSetSystemTimeMessage(date: Date, shouldAdjustForDST: boolean): void;
    sendGetHistoryMessage(fromTime: Date, toTime: Date): void;
}
export declare class CircuitCommands extends Commands {
    sendSetCircuitMessage(circuitId: number, nameIndex: number, circuitFunction: number, circuitInterface: number, freeze: boolean, colorPos: number): void;
    sendSetCircuitStateMessage(circuitId: number, circuitState: boolean): void;
    sendIntellibriteMessage(command: LightCommands): void;
    sendSetCircuitRuntimeMessage(circuitId: number, runTime: number): void;
}
export declare class ChlorCommands extends Commands {
    sendSetChlorOutputMessage(poolOutput: number, spaOutput: number): void;
    sendGetSaltCellConfigMessage(): void;
}
export declare class ChemCommands extends Commands {
    sendGetChemStatusMessage(): void;
    sendGetChemHistoryMessage(fromTime: Date, toTime: Date): void;
}
export declare class BodyCommands extends Commands {
    sendSetPointMessage(bodyType: number, temperature: number): void;
    sendHeatModeMessage(bodyType: number, heatMode: number): void;
}
export declare class ScheduleCommands extends Commands {
    sendGetSchedulesMessage(schedType: number): void;
    sendAddScheduleEventMessage(schedType: number): void;
    sendDeleteScheduleEventMessage(schedId: number): void;
    sendSetScheduleEventMessage(scheduleId: number, circuitId: number, startTime: number, stopTime: number, dayMask: number, flags: number, heatCmd: number, heatSetPoint: number): void;
}
export declare class PumpCommands extends Commands {
    sendGetPumpStatusMessage(pumpId: number): void;
    sendSetPumpSpeed(pumpId: number, circuitId: number, speed: number, isRPMs?: boolean): void;
}
export declare class OutboundGateway extends Outbound {
    createSendGatewayMessage(systemName: string): Buffer;
}
