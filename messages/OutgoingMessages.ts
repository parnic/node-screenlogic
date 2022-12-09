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
  public sendLoginMessage(password?: string[]) {
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
    this.unit.write(this.toBuffer());
  }

  public sendChallengeMessage() {
    this.messageId = 14;
    this.createBaseMessage();
    this.unit.write(this.toBuffer());
  }
  public sendVersionMessage() {
    this.messageId = 8120;
    this.createBaseMessage();
    this.unit.write(this.toBuffer());
  }
  public sendAddClientMessage() {
    this.messageId = 12522;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(this.unit.clientId);
    this.unit.write(this.toBuffer());
  }
  public sendRemoveClientMessage() {
    this.messageId = 12524;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(this.unit.clientId);
    this.unit.write(this.toBuffer());
  }
  public sendPingMessage() {
    this.messageId = 16;
    this.createBaseMessage();
    this.unit.write(this.toBuffer());
  }
};


export class EquipmentCommands extends Commands {
  public sendGetEquipmentStateMessage() {
    this.messageId = 12526;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
  }
  public sendGetControllerConfigMessage() {
    this.messageId = 12532; // controller config
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
  }
  public sendGetEquipmentConfigurationMessage() {
    this.messageId = 12566; //equipconfg
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
  }
  public sendGetSystemTimeMessage() {
    this.messageId = 8110;
    this.createBaseMessage();
    this.unit.write(this.toBuffer());
  }
  public sendCancelDelayMessage() {
    this.messageId = 12580;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
  }
  public sendGetCustomNamesMessage() {
    this.messageId = 12562;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
  }
  public sendGetWeatherMessage() {
    this.messageId = 9807;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
  }
  public sendSetSystemTimeMessage(date: Date, shouldAdjustForDST: boolean) {
    this.messageId = 8112;
    this.createBaseMessage();
    this.writeSLDateTime(date);
    this.writeInt32LE(shouldAdjustForDST ? 1 : 0);
    this.unit.write(this.toBuffer());
  }
  public sendGetHistoryMessage(fromTime: Date, toTime: Date) {
    this.messageId = 12534;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId);
    this.writeSLDateTime(fromTime);
    this.writeSLDateTime(toTime);
    this.writeInt32LE(this.senderId);
    this.unit.write(this.toBuffer());
  }
}

export class CircuitCommands extends Commands {
  public sendSetCircuitMessage(circuitId: number, circuitState: boolean) {
    this.messageId = 12530;
    this.createBaseMessage();
    // this.addHeader(this.senderId, this.messageId);
    // this._controllerId = controllerId;
    this.writeInt32LE(this.controllerId);
    this.writeInt32LE(circuitId + 499);
    this.writeInt32LE((circuitState ? 1 : 0) || 0);
    this.encode();
    this.unit.write(this.toBuffer());
  }
  public sendIntellibriteMessage(command: LightCommands) {
    this.messageId = 12556;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(command || 0);
    this.unit.write(this.toBuffer());
  }
  public sendSetCircuitRuntimeMessage(circuitId: number, runTime: number) {
    this.messageId = 12550;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(circuitId + 499);
    this.writeInt32LE(runTime);
    this.unit.write(this.toBuffer());
  }
}
export class ChlorCommands extends Commands {
  public sendSetChlorOutputMessage(poolOutput: number, spaOutput: number) {
    this.messageId = 12576;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(poolOutput || 0);
    this.writeInt32LE(spaOutput || 0);
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
  }
  public sendGetSaltCellConfigMessage() {
    this.messageId = 12572;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.unit.write(this.toBuffer());
  }
}
export class ChemCommands extends Commands {
  public sendGetChemStatusMessage() {
    this.messageId = 12592;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
  }
  public sendGetChemHistoryMessage(fromTime: Date, toTime: Date) {
    this.messageId = 12596;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeSLDateTime(fromTime);
    this.writeSLDateTime(toTime);
    this.writeInt32LE(this.senderId || 0);
    this.unit.write(this.toBuffer());
  }
}
export class BodyCommands extends Commands {
  public sendSetPointMessage(bodyType: number, temperature: number) {
    this.messageId = 12528;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(bodyType || 0);
    this.writeInt32LE(temperature || 0);
    this.unit.write(this.toBuffer());
  }
  public sendHeatModeMessage(bodyType: number, heatMode: number) {
    this.messageId = 12538;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE((bodyType - 1) || 0);
    this.writeInt32LE(heatMode || 0);
    this.unit.write(this.toBuffer());
  }
}
export class ScheduleCommands extends Commands {
  public sendGetSchedulesMessage(schedType: number) {
    this.messageId = 12542;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(schedType);
    this.unit.write(this.toBuffer());
  }
  public sendAddScheduleEventMessage(schedType: number) {
    this.messageId = 12544;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(schedType);
    this.unit.write(this.toBuffer());
  }
  public sendDeleteScheduleEventMessage(schedId: number) {
    this.messageId = 12546;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId);
    this.writeInt32LE(schedId + 699);
    this.unit.write(this.toBuffer());
  }
  public sendSetScheduleEventMessage(scheduleId: number, circuitId: number, startTime: number, stopTime: number, dayMask: number, flags: number, heatCmd: number, heatSetPoint: number) {
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
    this.unit.write(this.toBuffer());
  }
}
export class PumpCommands extends Commands {
  public sendGetPumpStatusMessage(pumpId: number) {
    this.messageId = 12584;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId);
    this.writeInt32LE(pumpId - 1);
    this.unit.write(this.toBuffer());
  }
  public sendSetPumpSpeed(pumpId: number, circuitId: number, setPoint: number, isRPMs?: boolean) {
    this.messageId = 12586;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId); // Always 0 in my case
    this.writeInt32LE(pumpId - 1);
    this.writeInt32LE(0); // Always 0 in my case
    this.writeInt32LE(circuitId); // This is indexed to the array of circuits returned in GetPumpStatus
    this.writeInt32LE(setPoint);
    this.writeInt32LE(isRPMs); 
    this.unit.write(this.toBuffer());
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