"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboundGateway = exports.PumpCommands = exports.ScheduleCommands = exports.BodyCommands = exports.ChemCommands = exports.ChlorCommands = exports.CircuitCommands = exports.EquipmentCommands = exports.ConnectionCommands = exports.Commands = void 0;
const SLMessage_1 = require("./SLMessage");
class Commands extends SLMessage_1.Outbound {
    constructor(unit) {
        super(unit.controllerId, unit.senderId);
        this.unit = unit;
    }
}
exports.Commands = Commands;
class ConnectionCommands extends Commands {
    sendLoginMessage(password) {
        this.action = 27;
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
        return this;
    }
    sendChallengeMessage() {
        this.action = 14;
        this.createBaseMessage();
        this.unit.write(this.toBuffer());
        return this;
    }
    sendVersionMessage() {
        this.action = 8120;
        this.createBaseMessage();
        this.unit.write(this.toBuffer());
        return this;
    }
    sendAddClientMessage() {
        this.action = 12522;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(this.unit.clientId);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendRemoveClientMessage() {
        this.action = 12524;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(this.unit.clientId);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendPingMessage() {
        this.action = 16;
        this.createBaseMessage();
        this.unit.write(this.toBuffer());
        return this;
    }
}
exports.ConnectionCommands = ConnectionCommands;
;
class EquipmentCommands extends Commands {
    sendGetEquipmentStateMessage() {
        this.action = 12526;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetControllerConfigMessage() {
        this.action = 12532; // controller config
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetNumCircuitNamesMessage() {
        this.action = 12558;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetCircuitNamesMessage(idx, cnt) {
        this.action = 12561;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(idx);
        this.writeInt32LE(cnt);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetCircuitDefinitionsMessage() {
        this.action = 12510;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetEquipmentConfigurationMessage() {
        this.action = 12566; //equipconfg
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    async sendSetEquipmentConfigurationMessageAsync(data) {
        this.action = 12568; //setequipconfg
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetSystemTimeMessage() {
        this.action = 8110;
        this.createBaseMessage();
        this.unit.write(this.toBuffer());
        return this;
    }
    sendCancelDelayMessage() {
        this.action = 12580;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetCustomNamesMessage() {
        this.action = 12562;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetCustomNameMessage(idx, name) {
        this.action = 12564;
        this.createBaseMessage();
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(idx);
        this.writeSLString(name);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetWeatherMessage() {
        this.action = 9807;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetSystemTimeMessage(date, shouldAdjustForDST) {
        this.action = 8112;
        this.createBaseMessage();
        this.writeSLDateTime(date);
        this.writeInt32LE(shouldAdjustForDST ? 1 : 0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetHistoryMessage(fromTime, toTime) {
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
exports.EquipmentCommands = EquipmentCommands;
class CircuitCommands extends Commands {
    sendSetCircuitMessage(circuitId, nameIndex, circuitFunction, circuitInterface, freeze, colorPos) {
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
    sendSetCircuitStateMessage(circuitId, circuitState) {
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
    sendIntellibriteMessage(command) {
        this.action = 12556;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(command || 0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetCircuitRuntimeMessage(circuitId, runTime) {
        this.action = 12550;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(circuitId + 499);
        this.writeInt32LE(runTime);
        this.unit.write(this.toBuffer());
        return this;
    }
}
exports.CircuitCommands = CircuitCommands;
class ChlorCommands extends Commands {
    sendSetChlorOutputMessage(poolOutput, spaOutput) {
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
    sendGetSaltCellConfigMessage() {
        this.action = 12572;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetSaltCellEnableMessage(isActive) {
        this.action = 12574;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(isActive ? 1 : 0);
        this.unit.write(this.toBuffer());
        return this;
    }
}
exports.ChlorCommands = ChlorCommands;
class ChemCommands extends Commands {
    sendGetChemStatusMessage() {
        this.action = 12592;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendGetChemHistoryMessage(fromTime, toTime) {
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
exports.ChemCommands = ChemCommands;
class BodyCommands extends Commands {
    sendSetPointMessage(bodyType, temperature) {
        this.action = 12528;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(bodyType || 0);
        this.writeInt32LE(temperature || 0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendCoolSetPointMessage(bodyType, temperature) {
        this.action = 12590;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(bodyType || 0);
        this.writeInt32LE(temperature || 0);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendHeatModeMessage(bodyType, heatMode) {
        this.action = 12538;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE((bodyType - 1) || 0);
        this.writeInt32LE(heatMode || 0);
        this.unit.write(this.toBuffer());
        return this;
    }
}
exports.BodyCommands = BodyCommands;
class ScheduleCommands extends Commands {
    sendGetSchedulesMessage(schedType) {
        this.action = 12542;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(schedType);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendAddScheduleEventMessage(schedType) {
        this.action = 12544;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(schedType);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendDeleteScheduleEventMessage(schedId) {
        this.action = 12546;
        this.createBaseMessage();
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(schedId + 699);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetScheduleEventMessage(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint) {
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
exports.ScheduleCommands = ScheduleCommands;
class PumpCommands extends Commands {
    sendGetPumpStatusMessage(pumpId) {
        this.action = 12584;
        this.createBaseMessage();
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(pumpId - 1);
        this.unit.write(this.toBuffer());
        return this;
    }
    sendSetPumpSpeed(pumpId, circuitId, speed, isRPMs) {
        this.action = 12586;
        if (typeof isRPMs === 'undefined') {
            if (speed < 400) {
                isRPMs = false;
            }
            else
                isRPMs = true;
        }
        let _isRPMs = isRPMs ? 1 : 0;
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
exports.PumpCommands = PumpCommands;
class OutboundGateway extends SLMessage_1.Outbound {
    createSendGatewayMessage(systemName) {
        this.action = 18003; // SLSendGatewayDataMessage.MSG_ID;
        this.createBaseMessage();
        this.writeSLString(systemName);
        this.writeSLString(systemName);
        return this.toBuffer();
    }
}
exports.OutboundGateway = OutboundGateway;
;
//# sourceMappingURL=OutgoingMessages.js.map