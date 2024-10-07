"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboundGateway = exports.PumpCommands = exports.ScheduleCommands = exports.BodyCommands = exports.ChemCommands = exports.ChlorCommands = exports.CircuitCommands = exports.EquipmentCommands = exports.ConnectionCommands = exports.Commands = void 0;
const SLMessage_1 = require("./SLMessage");
const index_1 = require("../index");
const EquipmentConfig_1 = require("./config/EquipmentConfig");
class Commands extends SLMessage_1.Outbound {
    constructor(unit, senderId) {
        super(unit.controllerId, senderId !== null && senderId !== void 0 ? senderId : unit.senderId);
        this.unit = unit;
    }
}
exports.Commands = Commands;
class ConnectionCommands extends Commands {
    sendLoginMessage(password, senderId) {
        this.action = index_1.ConnectionMessage.ResponseIDs.Login - 1;
        this.createBaseMessage(senderId);
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
    sendChallengeMessage(senderId) {
        this.action = index_1.ConnectionMessage.ResponseIDs.Challenge - 1;
        this.createBaseMessage(senderId);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendVersionMessage(senderId) {
        this.action = index_1.ConnectionMessage.ResponseIDs.Version - 1;
        this.createBaseMessage(senderId);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendAddClientMessage(clientId, senderId) {
        this.action = index_1.ConnectionMessage.ResponseIDs.AddClient - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(clientId !== null && clientId !== void 0 ? clientId : this.unit.clientId);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendRemoveClientMessage(clientId, senderId) {
        this.action = index_1.ConnectionMessage.ResponseIDs.RemoveClient - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(clientId !== null && clientId !== void 0 ? clientId : this.unit.clientId);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendPingMessage(senderId) {
        this.action = index_1.ConnectionMessage.ResponseIDs.Ping - 1;
        this.createBaseMessage(senderId);
        this.unit.write(this.toBuffer());
        return this;
    }
}
exports.ConnectionCommands = ConnectionCommands;
class EquipmentCommands extends Commands {
    sendGetEquipmentStateMessage(senderId) {
        this.action = index_1.EquipmentStateMessage.ResponseIDs.EquipmentState - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetControllerConfigMessage(senderId) {
        this.action = EquipmentConfig_1.EquipmentConfigurationMessage.ResponseIDs.GetControllerConfig - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetNumCircuitNamesMessage(senderId) {
        this.action = EquipmentConfig_1.EquipmentConfigurationMessage.ResponseIDs.NumCircuitNames - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetCircuitNamesMessage(idx, cnt, senderId) {
        this.action = EquipmentConfig_1.EquipmentConfigurationMessage.ResponseIDs.GetCircuitNames;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.writeInt32LE(idx);
        this.writeInt32LE(cnt);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetCircuitDefinitionsMessage(senderId) {
        this.action = EquipmentConfig_1.EquipmentConfigurationMessage.ResponseIDs.GetCircuitDefinitions - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetEquipmentConfigurationMessage(senderId) {
        this.action = EquipmentConfig_1.EquipmentConfigurationMessage.ResponseIDs.GetEquipmentConfiguration - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetEquipmentConfigurationMessageAsync(data, senderId) {
        this.action = EquipmentConfig_1.EquipmentConfigurationMessage.ResponseIDs.SetEquipmentConfiguration; //setequipconfg
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetSystemTimeMessage(senderId) {
        this.action = index_1.EquipmentStateMessage.ResponseIDs.SystemTime - 1;
        this.createBaseMessage(senderId);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendCancelDelayMessage(senderId) {
        this.action = index_1.EquipmentStateMessage.ResponseIDs.CancelDelay - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetCustomNamesMessage(senderId) {
        this.action = EquipmentConfig_1.EquipmentConfigurationMessage.ResponseIDs.GetCustomNamesAck - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetCustomNameMessage(idx, name, senderId) {
        this.action = EquipmentConfig_1.EquipmentConfigurationMessage.ResponseIDs.SetCustomNameAck - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(idx);
        this.writeSLString(name);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetWeatherMessage(senderId) {
        this.action = EquipmentConfig_1.EquipmentConfigurationMessage.ResponseIDs.WeatherForecastAck - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetSystemTimeMessage(date, shouldAdjustForDST, senderId) {
        this.action = index_1.EquipmentStateMessage.ResponseIDs.SetSystemTime - 1;
        this.createBaseMessage(senderId);
        this.writeSLDateTime(date);
        this.writeInt32LE(shouldAdjustForDST ? 1 : 0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetHistoryMessage(fromTime, toTime, senderId) {
        this.action = EquipmentConfig_1.EquipmentConfigurationMessage.ResponseIDs.HistoryDataPending - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.controllerId);
        this.writeSLDateTime(fromTime);
        this.writeSLDateTime(toTime);
        this.writeInt32LE(senderId !== null && senderId !== void 0 ? senderId : this.senderId);
        this.unit.write(this.toBuffer());
        return this;
    }
}
exports.EquipmentCommands = EquipmentCommands;
class CircuitCommands extends Commands {
    sendSetCircuitMessage(circuitId, nameIndex, circuitFunction, circuitInterface, freeze, colorPos, senderId) {
        this.action = index_1.CircuitMessage.ResponseIDs.SetCircuitInfo - 1;
        this.createBaseMessage(senderId);
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
    sendSetCircuitStateMessage(circuitId, circuitState, senderId) {
        this.action = index_1.CircuitMessage.ResponseIDs.SetCircuitState - 1;
        this.createBaseMessage(senderId);
        // this.addHeader(this.senderId, this.messageId);
        // this._controllerId = controllerId;
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(circuitId + 499);
        this.writeInt32LE((circuitState ? 1 : 0) || 0);
        this.encode();
        this.unit.write(this.toBuffer());
        return this;
    }
    sendIntellibriteMessage(command, senderId) {
        this.action = index_1.CircuitMessage.ResponseIDs.SetLightState - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(command || 0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetCircuitRuntimeMessage(circuitId, runTime, senderId) {
        this.action = index_1.CircuitMessage.ResponseIDs.SetCircuitRunTime - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(circuitId + 499);
        this.writeInt32LE(runTime);
        this.unit.write(this.toBuffer());
        return this;
    }
}
exports.CircuitCommands = CircuitCommands;
class ChlorCommands extends Commands {
    sendSetChlorOutputMessage(poolOutput, spaOutput, senderId) {
        this.action = index_1.ChlorMessage.ResponseIDs.SetIntellichlorConfig - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(poolOutput || 0);
        this.writeInt32LE(spaOutput || 0);
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetSaltCellConfigMessage(senderId) {
        this.action = index_1.ChlorMessage.ResponseIDs.GetIntellichlorConfig - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.unit.controllerId);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetSaltCellEnableMessage(isActive, senderId) {
        this.action = index_1.ChlorMessage.ResponseIDs.SetIntellichlorEnabled - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(isActive ? 1 : 0);
        this.unit.write(this.toBuffer());
        return this;
    }
}
exports.ChlorCommands = ChlorCommands;
class ChemCommands extends Commands {
    sendGetChemStatusMessage(senderId) {
        this.action = index_1.ChemMessage.ResponseIDs.GetChemicalData - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetChemHistoryMessage(fromTime, toTime, senderId) {
        this.action = index_1.ChemMessage.ResponseIDs.HistoryDataPending - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.writeSLDateTime(fromTime);
        this.writeSLDateTime(toTime);
        this.writeInt32LE(senderId !== null && senderId !== void 0 ? senderId : this.senderId);
        this.unit.write(this.toBuffer());
        return this;
    }
}
exports.ChemCommands = ChemCommands;
class BodyCommands extends Commands {
    sendSetPointMessage(bodyType, temperature, senderId) {
        this.action = index_1.HeaterMessage.ResponseIDs.SetHeatSetPoint - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(bodyType || 0);
        this.writeInt32LE(temperature || 0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendCoolSetPointMessage(bodyType, temperature, senderId) {
        this.action = index_1.HeaterMessage.ResponseIDs.SetCoolSetPoint - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(bodyType || 0);
        this.writeInt32LE(temperature || 0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendHeatModeMessage(bodyType, heatMode, senderId) {
        this.action = index_1.HeaterMessage.ResponseIDs.SetHeatMode - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(bodyType || 0);
        this.writeInt32LE(heatMode || 0);
        this.unit.write(this.toBuffer());
        return this;
    }
}
exports.BodyCommands = BodyCommands;
class ScheduleCommands extends Commands {
    sendGetSchedulesMessage(schedType, senderId) {
        this.action = index_1.ScheduleMessage.ResponseIDs.GetSchedule - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.writeInt32LE(schedType);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendAddScheduleEventMessage(schedType, senderId) {
        this.action = index_1.ScheduleMessage.ResponseIDs.AddSchedule - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(0);
        this.writeInt32LE(schedType);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendDeleteScheduleEventMessage(schedId, senderId) {
        this.action = index_1.ScheduleMessage.ResponseIDs.DeleteSchedule - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(schedId + 699);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetScheduleEventMessage(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint, senderId) {
        this.action = index_1.ScheduleMessage.ResponseIDs.SetSchedule - 1;
        this.createBaseMessage(senderId);
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
exports.ScheduleCommands = ScheduleCommands;
class PumpCommands extends Commands {
    sendGetPumpStatusMessage(pumpId, senderId) {
        this.action = index_1.PumpMessage.ResponseIDs.PumpStatus - 1;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(pumpId - 1);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetPumpSpeed(pumpId, circuitId, speed, isRPMs, senderId) {
        this.action = index_1.PumpMessage.ResponseIDs.SetPumpSpeed - 1;
        if (typeof isRPMs === 'undefined') {
            if (speed < 400) {
                isRPMs = false;
            }
            else
                isRPMs = true;
        }
        const _isRPMs = isRPMs ? 1 : 0;
        this.createBaseMessage(senderId);
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(pumpId - 1);
        this.writeInt32LE(circuitId); // This is indexed to the array of circuits returned in GetPumpStatus
        this.writeInt32LE(speed);
        this.writeInt32LE(_isRPMs);
        this.unit.write(this.toBuffer());
        return this;
    }
}
exports.PumpCommands = PumpCommands;
class OutboundGateway extends SLMessage_1.Outbound {
    createSendGatewayMessage(systemName, senderId) {
        this.action = index_1.ConnectionMessage.ResponseIDs.GatewayResponse - 1;
        this.createBaseMessage(senderId);
        this.writeSLString(systemName);
        this.writeSLString(systemName);
        return this.toBuffer();
    }
}
exports.OutboundGateway = OutboundGateway;
//# sourceMappingURL=OutgoingMessages.js.map