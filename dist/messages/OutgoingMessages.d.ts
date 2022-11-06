/// <reference types="node" />
import { Outbound } from "./SLMessage";
import { LightCommands, UnitConnection } from "../index";
export declare class Commands extends Outbound {
    protected unit: UnitConnection;
    constructor(unit: UnitConnection);
}
export declare class ConnectionCommands extends Commands {
    createLoginMessage(password?: string[]): Buffer;
    createChallengeMessage(): Buffer;
    createVersionMessage(): Buffer;
    createAddClientMessage(): Buffer;
    createRemoveClientMessage(): Buffer;
    createPingMessage(): Buffer;
}
export declare class EquipmentCommands extends Commands {
    createEquipmentStateMessage(): Buffer;
    createGetControllerConfigMessage(): Buffer;
    createGetEquipmentConfigurationMessage(): Buffer;
    createGetSystemTimeMessage(): Buffer;
    createCancelDelayMessage(): Buffer;
    createWeatherMessage(): Buffer;
    createSetSystemTimeMessage(date: Date, shouldAdjustForDST: boolean): Buffer;
    createGetHistoryMessage(fromTime: Date, toTime: Date): Buffer;
}
export declare class CircuitCommands extends Commands {
    createSetCircuitMessage(circuitId: number, circuitState: boolean): Buffer;
    createIntellibriteMessage(command: LightCommands): Buffer;
    createSetCircuitRuntimeMessage(circuitId: number, runTime: number): Buffer;
}
export declare class ChlorCommands extends Commands {
    createSetChlorOutputMessage(poolOutput: number, spaOutput: number): Buffer;
    createSaltCellConfigMessage(): Buffer;
}
export declare class ChemCommands extends Commands {
    createChemStatusMessage(): Buffer;
    createGetChemHistoryMessage(fromTime: Date, toTime: Date): Buffer;
}
export declare class BodyCommands extends Commands {
    createSetPointMessage(bodyType: number, temperature: number): Buffer;
    createHeatModeMessage(bodyType: number, heatMode: number): Buffer;
}
export declare class ScheduleCommands extends Commands {
    createGetSchedulesMessage(schedType: number): Buffer;
    createAddScheduleEventMessage(schedType: number): Buffer;
    createDeleteScheduleEventMessage(schedId: number): Buffer;
    createSetScheduleEventMessage(scheduleId: number, circuitId: number, startTime: number, stopTime: number, dayMask: number, flags: number, heatCmd: number, heatSetPoint: number): Buffer;
}
export declare class PumpCommands extends Commands {
    createPumpStatusMessage(pumpId: number): Buffer;
    setPumpSpeed(pumpId: number, circuitId: number, speed: number, isRPM?: boolean): Buffer;
}
export declare class OutboundGateway extends Outbound {
    createSendGatewayMessage(systemName: string): Buffer;
}
