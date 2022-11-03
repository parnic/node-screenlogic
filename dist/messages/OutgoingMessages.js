"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboundGateway = exports.PumpCommands = exports.ScheduleCommands = exports.BodyCommands = exports.ChemCommands = exports.ChlorCommands = exports.CircuitCommands = exports.EquipmentCommands = exports.ConnectionCommands = exports.Commands = void 0;
const SLMessage_1 = require("./SLMessage");
class Commands extends SLMessage_1.Outbound {
    unit;
    constructor(unit) {
        super(unit.controllerId, unit.senderId);
        this.unit = unit;
    }
}
exports.Commands = Commands;
class ConnectionCommands extends Commands {
    createLoginMessage(password) {
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
    createChallengeMessage() {
        this.messageId = 14;
        this.createBaseMessage();
        return this.toBuffer();
    }
    createVersionMessage() {
        this.messageId = 8120;
        this.createBaseMessage();
        return this.toBuffer();
    }
    createAddClientMessage() {
        this.messageId = 12522;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(this.unit.clientId);
        return this.toBuffer();
    }
    createRemoveClientMessage() {
        this.messageId = 12524;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(this.unit.clientId);
        return this.toBuffer();
    }
    createPingMessage() {
        this.messageId = 16;
        this.createBaseMessage();
        return this.toBuffer();
    }
}
exports.ConnectionCommands = ConnectionCommands;
;
class EquipmentCommands extends Commands {
    createEquipmentStateMessage() {
        this.messageId = 12526;
        this.createBaseMessage();
        this.writeInt32LE(0);
        return this.toBuffer();
    }
    createGetControllerConfigMessage() {
        this.messageId = 12532;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        return this.toBuffer();
    }
    createGetSystemTimeMessage() {
        this.messageId = 8110;
        this.createBaseMessage();
        return this.toBuffer();
    }
    createCancelDelayMessage() {
        this.messageId = 12580;
        this.createBaseMessage();
        this.writeInt32LE(0);
        return this.toBuffer();
    }
    createEquipmentConfigurationMessage() {
        this.messageId = 12566;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        return this.toBuffer();
    }
    createWeatherMessage() {
        this.messageId = 9807;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        return this.toBuffer();
    }
    createSetSystemTimeMessage(date, shouldAdjustForDST) {
        this.messageId = 8112;
        this.createBaseMessage();
        this.writeSLDateTime(date);
        this.writeInt32LE(shouldAdjustForDST ? 1 : 0);
        return this.toBuffer();
    }
    createGetHistoryMessage(fromTime, toTime) {
        this.messageId = 12534;
        this.createBaseMessage();
        this.writeInt32LE(this.controllerId);
        this.writeSLDateTime(fromTime);
        this.writeSLDateTime(toTime);
        this.writeInt32LE(this.senderId);
        return this.toBuffer();
    }
}
exports.EquipmentCommands = EquipmentCommands;
class CircuitCommands extends Commands {
    createSetCircuitMessage(circuitId, circuitState) {
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
    createIntellibriteMessage(command) {
        this.messageId = 12556;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(command || 0);
        return this.toBuffer();
    }
    createSetCircuitRuntimeMessage(circuitId, runTime) {
        this.messageId = 12550;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(circuitId + 499);
        this.writeInt32LE(runTime);
        return this.toBuffer();
    }
}
exports.CircuitCommands = CircuitCommands;
class ChlorCommands extends Commands {
    createSetChlorOutputMessage(poolOutput, spaOutput) {
        this.messageId = 12576;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(poolOutput || 0);
        this.writeInt32LE(spaOutput || 0);
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        return this.toBuffer();
    }
    createSaltCellConfigMessage() {
        this.messageId = 12572;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        return this.toBuffer();
    }
}
exports.ChlorCommands = ChlorCommands;
class ChemCommands extends Commands {
    createChemStatusMessage() {
        this.messageId = 12592;
        this.createBaseMessage();
        this.writeInt32LE(0);
        return this.toBuffer();
    }
    createGetChemHistoryMessage(fromTime, toTime) {
        this.messageId = 12596;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeSLDateTime(fromTime);
        this.writeSLDateTime(toTime);
        this.writeInt32LE(this.senderId || 0);
        return this.toBuffer();
    }
}
exports.ChemCommands = ChemCommands;
class BodyCommands extends Commands {
    createSetPointMessage(bodyType, temperature) {
        this.messageId = 12528;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(bodyType || 0);
        this.writeInt32LE(temperature || 0);
        return this.toBuffer();
    }
    createHeatModeMessage(bodyType, heatMode) {
        this.messageId = 12538;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(bodyType || 0);
        this.writeInt32LE(heatMode || 0);
        return this.toBuffer();
    }
}
exports.BodyCommands = BodyCommands;
class ScheduleCommands extends Commands {
    createGetSchedulesMessage(schedType) {
        this.messageId = 12542;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(schedType);
        return this.toBuffer();
    }
    createAddScheduleEventMessage(schedType) {
        this.messageId = 12544;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(schedType);
        return this.toBuffer();
    }
    createDeleteScheduleEventMessage(schedId) {
        this.messageId = 12546;
        this.createBaseMessage();
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(schedId + 699);
        return this.toBuffer();
    }
    createSetScheduleEventMessage(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint) {
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
exports.ScheduleCommands = ScheduleCommands;
class PumpCommands extends Commands {
    createPumpStatusMessage(pumpId) {
        this.messageId = 12584;
        this.createBaseMessage();
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(pumpId);
        return this.toBuffer();
    }
    setPumpSpeed(pumpId, circuitId, speed, isRPM) {
        if (typeof isRPM === 'undefined') {
            if (speed < 200)
                isRPM = false;
            else
                isRPM = true;
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
exports.PumpCommands = PumpCommands;
class OutboundGateway extends SLMessage_1.Outbound {
    createSendGatewayMessage(systemName) {
        this.messageId = 18003; // SLSendGatewayDataMessage.MSG_ID;
        this.createBaseMessage();
        this.writeSLString(systemName);
        this.writeSLString(systemName);
        return this.toBuffer();
    }
}
exports.OutboundGateway = OutboundGateway;
;
//# sourceMappingURL=OutgoingMessages.js.map