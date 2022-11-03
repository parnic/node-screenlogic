import { Outbound } from "./SLMessage";
import { LightCommands, UnitConnection } from "../index";

export class Commands extends Outbound {
  protected unit: UnitConnection;
  constructor(unit: UnitConnection) {
    super(unit.controllerId, unit.senderId);
    this.unit = unit;
  }
}

export class ConnectionCommands extends Commands {
  public createLoginMessage(password?: string[]) {
    this.messageId = 27;
    this.createBaseMessage();
    // this.addHeader(this.senderId, this.messageId)
    this.writeInt32LE(348); // schema
    this.writeInt32LE(0); // connection type
    this.writeSLString('node-screenlogic'); // version

    if (!password) {
      password = new Array(16);
    }
    if (password.length > 16) {
      password = password.slice(0, 16);
    }
    this.writeSLArray(password); // encoded password. empty/unused for local connections

    this.writeInt32LE(2); // procID
    return this.toBuffer();
  }

  public createChallengeMessage() {
    this.messageId = 14;
    this.createBaseMessage();
    return this.toBuffer();
  }
  public createVersionMessage() {
    this.messageId = 8120;
    this.createBaseMessage();
    return this.toBuffer();
  }
  public createAddClientMessage() {
    this.messageId = 12522;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(this.unit.clientId);
    return this.toBuffer();
  }
  public createRemoveClientMessage() {
    this.messageId = 12524;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(this.unit.clientId);
    return this.toBuffer();
  }
  public createPingMessage() {
    this.messageId = 16;
    this.createBaseMessage();
    return this.toBuffer();
  }
};


export class EquipmentCommands extends Commands {
  public createEquipmentStateMessage() {
    this.messageId = 12526;
    this.createBaseMessage();
    this.writeInt32LE(0);
    return this.toBuffer();
  }
  public createGetControllerConfigMessage() {
    this.messageId = 12532;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    return this.toBuffer();
  }
  public createGetSystemTimeMessage() {
    this.messageId = 8110;
    this.createBaseMessage();
    return this.toBuffer();
  }
  public createCancelDelayMessage() {
    this.messageId = 12580;
    this.createBaseMessage();
    this.writeInt32LE(0);
    return this.toBuffer();
  }
  public createEquipmentConfigurationMessage() {
    this.messageId = 12566;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    return this.toBuffer();
  }
  public createWeatherMessage() {
    this.messageId = 9807;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    return this.toBuffer();
  }
  public createSetSystemTimeMessage(date: Date, shouldAdjustForDST: boolean) {
    this.messageId = 8112;
    this.createBaseMessage();
    this.writeSLDateTime(date);
    this.writeInt32LE(shouldAdjustForDST ? 1 : 0);
    return this.toBuffer();
  }
  public createGetHistoryMessage(fromTime: Date, toTime: Date) {
    this.messageId = 12534;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId);
    this.writeSLDateTime(fromTime);
    this.writeSLDateTime(toTime);
    this.writeInt32LE(this.senderId);
    return this.toBuffer();
  }
}

export class CircuitCommands extends Commands {
  public createSetCircuitMessage(circuitId: number, circuitState: boolean) {
    this.messageId = 12530;
    this.createBaseMessage();
    // this.addHeader(this.senderId, this.messageId);
    // this._controllerId = controllerId;
    this.writeInt32LE(this.controllerId);
    this.writeInt32LE(circuitId + 499);
    this.writeInt32LE((circuitState ? 1 : 0) || 0);
    this.encode();
    return this.toBuffer();
  }
  public createIntellibriteMessage(command: LightCommands) {
    this.messageId = 12556;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(command || 0);
    return this.toBuffer();
  }
  public createSetCircuitRuntimeMessage(circuitId: number, runTime: number) {
    this.messageId = 12550;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(circuitId + 499);
    this.writeInt32LE(runTime);
    return this.toBuffer();
  }
}
export class ChlorCommands extends Commands {
  public createSetChlorOutputMessage(poolOutput: number, spaOutput: number) {
    this.messageId = 12576;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(poolOutput || 0);
    this.writeInt32LE(spaOutput || 0);
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    return this.toBuffer();
  }
  public createSaltCellConfigMessage() {
    this.messageId = 12572;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    return this.toBuffer();
  }
}
export class ChemCommands extends Commands {
  public createChemStatusMessage() {
    this.messageId = 12592;
    this.createBaseMessage();
    this.writeInt32LE(0);
    return this.toBuffer();
  }
  public createGetChemHistoryMessage(fromTime: Date, toTime: Date) {
    this.messageId = 12596;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeSLDateTime(fromTime);
    this.writeSLDateTime(toTime);
    this.writeInt32LE(this.senderId || 0);
    return this.toBuffer();
  }
}
export class BodyCommands extends Commands {
  public createSetPointMessage(bodyType: number, temperature: number) {
    this.messageId = 12528;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(bodyType || 0);
    this.writeInt32LE(temperature || 0);
    return this.toBuffer();
  }
  public createHeatModeMessage(bodyType: number, heatMode: number) {
    this.messageId = 12538;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(bodyType || 0);
    this.writeInt32LE(heatMode || 0);
    return this.toBuffer();
  }
}
export class ScheduleCommands extends Commands {
  public createGetSchedulesMessage(schedType: number) {
    this.messageId = 12542;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(schedType);
    return this.toBuffer();
  }
  public createAddScheduleEventMessage(schedType: number) {
    this.messageId = 12544;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(schedType);
    return this.toBuffer();
  }
  public createDeleteScheduleEventMessage(schedId: number) {
    this.messageId = 12546;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId);
    this.writeInt32LE(schedId + 699);
    return this.toBuffer();
  }
  public createSetScheduleEventMessage(scheduleId: number, circuitId: number, startTime: number, stopTime: number, dayMask: number, flags: number, heatCmd: number, heatSetPoint: number) {
    this.messageId = 12548;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(scheduleId + 699);
    this.writeInt32LE(circuitId + 499);
    this.writeInt32LE(startTime);
    this.writeInt32LE(stopTime);
    this.writeInt32LE(dayMask);
    this.writeInt32LE(flags);
    this.writeInt32LE(heatCmd);
    this.writeInt32LE(heatSetPoint);
    return this.toBuffer();
  }
}
export class PumpCommands extends Commands {
  public createPumpStatusMessage(pumpId: number) {
    this.messageId = 12584;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId);
    this.writeInt32LE(pumpId);
    return this.toBuffer();
  }
  public setPumpSpeed(pumpId: number, circuitId: number, speed: number, isRPM?: boolean) {
    if (typeof isRPM === 'undefined') {
      if (speed < 200) isRPM = false
      else isRPM = true;
    }
    this.messageId = 12586;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId); // Always 0 in my case
    this.writeInt32LE(pumpId); // presumably pumpId, always 0 in my case
    this.writeInt32LE(circuitId); // This is indexed to the array of circuits returned in GetPumpStatus
    this.writeInt32LE(speed);
    this.writeInt32LE(isRPM ? 1 : 0); // 0 for GPM, 1 for RPMs
    return this.toBuffer();
  }
}
export class OutboundGateway extends Outbound {
  public createSendGatewayMessage(systemName: string) {
    
    this.messageId = 18003; // SLSendGatewayDataMessage.MSG_ID;
    this.createBaseMessage();
    this.writeSLString(systemName);
    this.writeSLString(systemName);
    return this.toBuffer();
  }
};