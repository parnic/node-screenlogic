import { Outbound } from './SLMessage';
import { LightCommands, UnitConnection } from '../index';
import { rawData } from './config/EquipmentConfig';

export class Commands extends Outbound {
  protected unit: UnitConnection;
  constructor(unit: UnitConnection, senderId?: number) {
    super(unit.controllerId, senderId ?? unit.senderId);
    this.unit = unit;
  }
}

export class ConnectionCommands extends Commands {
  public sendLoginMessage(password?: Buffer) {
    this.action = 27;
    this.createBaseMessage();
    // this.addHeader(this.senderId, this.messageId)
    this.writeInt32LE(348); // schema
    this.writeInt32LE(0); // connection type
    this.writeSLString('node-screenlogic'); // version

    if (!password) {
      password = Buffer.alloc(16);
    }
    if (password.length > 16) {
      password = password.slice(0, 16);
    }
    this.writeSLArray(password); // encoded password. empty/unused for local connections

    this.writeInt32LE(2); // procID
    this.unit.write(this.toBuffer());
    return this;
  }

  public sendChallengeMessage() {
    this.action = 14;
    this.createBaseMessage();
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendVersionMessage() {
    this.action = 8120;
    this.createBaseMessage();
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendAddClientMessage() {
    this.action = 12522;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(this.unit.clientId);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendRemoveClientMessage() {
    this.action = 12524;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(this.unit.clientId);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendPingMessage() {
    this.action = 16;
    this.createBaseMessage();
    this.unit.write(this.toBuffer());
    return this;
  }
}


export class EquipmentCommands extends Commands {
  public sendGetEquipmentStateMessage() {
    this.action = 12526;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendGetControllerConfigMessage() {
    this.action = 12532; // controller config
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendGetNumCircuitNamesMessage() {
    this.action = 12558;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendGetCircuitNamesMessage(idx, cnt) {
    this.action = 12561;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(idx);
    this.writeInt32LE(cnt);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendGetCircuitDefinitionsMessage() {
    this.action = 12510;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendGetEquipmentConfigurationMessage() {
    this.action = 12566; //equipconfg
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public async sendSetEquipmentConfigurationMessageAsync(data: rawData) {

    this.action = 12568; //setequipconfg
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendGetSystemTimeMessage() {
    this.action = 8110;
    this.createBaseMessage();
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendCancelDelayMessage() {
    this.action = 12580;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendGetCustomNamesMessage() {
    this.action = 12562;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendSetCustomNameMessage(idx: number, name: string) {
    this.action = 12564;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId);
    this.writeInt32LE(idx);
    this.writeSLString(name);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendGetWeatherMessage() {
    this.action = 9807;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendSetSystemTimeMessage(date: Date, shouldAdjustForDST: boolean) {
    this.action = 8112;
    this.createBaseMessage();
    this.writeSLDateTime(date);
    this.writeInt32LE(shouldAdjustForDST ? 1 : 0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendGetHistoryMessage(fromTime: Date, toTime: Date) {
    this.action = 12534;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId);
    this.writeSLDateTime(fromTime);
    this.writeSLDateTime(toTime);
    this.writeInt32LE(this.senderId);
    this.unit.write(this.toBuffer());
    return this;
  }
}

export class CircuitCommands extends Commands {
  public sendSetCircuitMessage(circuitId: number, nameIndex: number, circuitFunction: number, circuitInterface: number, freeze: boolean, colorPos: number) {
    this.action = 12520;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId);
    this.writeInt32LE(circuitId + 499);
    // normalize to 1 based ids for default names; 100 based for custom names
    // circuitArray[i].nameIndex = circuitArray[i].nameIndex < 101 ? circuitArray[i].nameIndex + 1 : circuitArray[i].nameIndex + 99;
    this.writeInt32LE(nameIndex < 102 ? nameIndex - 1 : nameIndex - 99);
    this.writeInt32LE(circuitFunction);
    this.writeInt32LE(circuitInterface);
    this.writeInt32LE(freeze ? 1 : 0); // could be other bits; this is a flag
    this.writeInt32LE(colorPos);
    this.encode();
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendSetCircuitStateMessage(circuitId: number, circuitState: boolean) {
    this.action = 12530;
    this.createBaseMessage();
    // this.addHeader(this.senderId, this.messageId);
    // this._controllerId = controllerId;
    this.writeInt32LE(this.controllerId);
    this.writeInt32LE(circuitId + 499);
    this.writeInt32LE((circuitState ? 1 : 0) || 0);
    this.encode();
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendIntellibriteMessage(command: LightCommands) {
    this.action = 12556;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(command || 0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendSetCircuitRuntimeMessage(circuitId: number, runTime: number) {
    this.action = 12550;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(circuitId + 499);
    this.writeInt32LE(runTime);
    this.unit.write(this.toBuffer());
    return this;
  }
}
export class ChlorCommands extends Commands {
  public sendSetChlorOutputMessage(poolOutput: number, spaOutput: number) {
    this.action = 12576;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(poolOutput || 0);
    this.writeInt32LE(spaOutput || 0);
    this.writeInt32LE(0);
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendGetSaltCellConfigMessage() {
    this.action = 12572;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendSetSaltCellEnableMessage(isActive?: boolean) {
    this.action = 12574;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(isActive ? 1 : 0);
    this.unit.write(this.toBuffer());
    return this;
  }
}
export class ChemCommands extends Commands {
  public sendGetChemStatusMessage() {
    this.action = 12592;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendGetChemHistoryMessage(fromTime: Date, toTime: Date) {
    this.action = 12596;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeSLDateTime(fromTime);
    this.writeSLDateTime(toTime);
    this.writeInt32LE(this.senderId || 0);
    this.unit.write(this.toBuffer());
    return this;
  }
}
export class BodyCommands extends Commands {
  public sendSetPointMessage(bodyType: number, temperature: number) {
    this.action = 12528;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(bodyType || 0);
    this.writeInt32LE(temperature || 0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendCoolSetPointMessage(bodyType: number, temperature: number) {
    this.action = 12590;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE(bodyType || 0);
    this.writeInt32LE(temperature || 0);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendHeatModeMessage(bodyType: number, heatMode: number) {
    this.action = 12538;
    this.createBaseMessage();
    this.writeInt32LE(this.unit.controllerId);
    this.writeInt32LE((bodyType - 1) || 0);
    this.writeInt32LE(heatMode || 0);
    this.unit.write(this.toBuffer());
    return this;
  }
}
export class ScheduleCommands extends Commands {
  public sendGetSchedulesMessage(schedType: number) {
    this.action = 12542;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(schedType);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendAddScheduleEventMessage(schedType: number) {
    this.action = 12544;
    this.createBaseMessage();
    this.writeInt32LE(0);
    this.writeInt32LE(schedType);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendDeleteScheduleEventMessage(schedId: number) {
    this.action = 12546;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId);
    this.writeInt32LE(schedId + 699);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendSetScheduleEventMessage(scheduleId: number, circuitId: number, startTime: number, stopTime: number, dayMask: number, flags: number, heatCmd: number, heatSetPoint: number) {
    this.action = 12548;
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
    return this;
  }
}
export class PumpCommands extends Commands {
  public sendGetPumpStatusMessage(pumpId: number) {
    this.action = 12584;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId);
    this.writeInt32LE(pumpId - 1);
    this.unit.write(this.toBuffer());
    return this;
  }
  public sendSetPumpSpeed(pumpId: number, circuitId: number, speed: number, isRPMs?: boolean) {
    this.action = 12586;
    if (typeof isRPMs === 'undefined') {
      if (speed < 400) { isRPMs = false; }
      else isRPMs = true;
    }
    const _isRPMs = isRPMs ? 1 : 0;
    this.createBaseMessage();
    this.writeInt32LE(this.controllerId);
    this.writeInt32LE(pumpId - 1);
    this.writeInt32LE(circuitId); // This is indexed to the array of circuits returned in GetPumpStatus
    this.writeInt32LE(speed);
    this.writeInt32LE(_isRPMs);
    this.unit.write(this.toBuffer());
    return this;
  }
}
export class OutboundGateway extends Outbound {
  public createSendGatewayMessage(systemName: string) {
    this.action = 18003; // SLSendGatewayDataMessage.MSG_ID;
    this.createBaseMessage();
    this.writeSLString(systemName);
    this.writeSLString(systemName);
    return this.toBuffer();
  }
}