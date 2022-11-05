"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.OutboundGateway = exports.PumpCommands = exports.ScheduleCommands = exports.BodyCommands = exports.ChemCommands = exports.ChlorCommands = exports.CircuitCommands = exports.EquipmentCommands = exports.ConnectionCommands = exports.Commands = void 0;
var SLMessage_1 = require("./SLMessage");
var Commands = /** @class */ (function (_super) {
    __extends(Commands, _super);
    function Commands(unit) {
        var _this = _super.call(this, unit.controllerId, unit.senderId) || this;
        _this.unit = unit;
        return _this;
    }
    return Commands;
}(SLMessage_1.Outbound));
exports.Commands = Commands;
var ConnectionCommands = /** @class */ (function (_super) {
    __extends(ConnectionCommands, _super);
    function ConnectionCommands() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConnectionCommands.prototype.createLoginMessage = function (password) {
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
    };
    ConnectionCommands.prototype.createChallengeMessage = function () {
        this.messageId = 14;
        this.createBaseMessage();
        return this.toBuffer();
    };
    ConnectionCommands.prototype.createVersionMessage = function () {
        this.messageId = 8120;
        this.createBaseMessage();
        return this.toBuffer();
    };
    ConnectionCommands.prototype.createAddClientMessage = function () {
        this.messageId = 12522;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(this.unit.clientId);
        return this.toBuffer();
    };
    ConnectionCommands.prototype.createRemoveClientMessage = function () {
        this.messageId = 12524;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(this.unit.clientId);
        return this.toBuffer();
    };
    ConnectionCommands.prototype.createPingMessage = function () {
        this.messageId = 16;
        this.createBaseMessage();
        return this.toBuffer();
    };
    return ConnectionCommands;
}(Commands));
exports.ConnectionCommands = ConnectionCommands;
;
var EquipmentCommands = /** @class */ (function (_super) {
    __extends(EquipmentCommands, _super);
    function EquipmentCommands() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EquipmentCommands.prototype.createEquipmentStateMessage = function () {
        this.messageId = 12526;
        this.createBaseMessage();
        this.writeInt32LE(0);
        return this.toBuffer();
    };
    EquipmentCommands.prototype.createGetControllerConfigMessage = function () {
        this.messageId = 12532;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        return this.toBuffer();
    };
    EquipmentCommands.prototype.createGetSystemTimeMessage = function () {
        this.messageId = 8110;
        this.createBaseMessage();
        return this.toBuffer();
    };
    EquipmentCommands.prototype.createCancelDelayMessage = function () {
        this.messageId = 12580;
        this.createBaseMessage();
        this.writeInt32LE(0);
        return this.toBuffer();
    };
    EquipmentCommands.prototype.createEquipmentConfigurationMessage = function () {
        this.messageId = 12566;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        return this.toBuffer();
    };
    EquipmentCommands.prototype.createWeatherMessage = function () {
        this.messageId = 9807;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        return this.toBuffer();
    };
    EquipmentCommands.prototype.createSetSystemTimeMessage = function (date, shouldAdjustForDST) {
        this.messageId = 8112;
        this.createBaseMessage();
        this.writeSLDateTime(date);
        this.writeInt32LE(shouldAdjustForDST ? 1 : 0);
        return this.toBuffer();
    };
    EquipmentCommands.prototype.createGetHistoryMessage = function (fromTime, toTime) {
        this.messageId = 12534;
        this.createBaseMessage();
        this.writeInt32LE(this.controllerId);
        this.writeSLDateTime(fromTime);
        this.writeSLDateTime(toTime);
        this.writeInt32LE(this.senderId);
        return this.toBuffer();
    };
    return EquipmentCommands;
}(Commands));
exports.EquipmentCommands = EquipmentCommands;
var CircuitCommands = /** @class */ (function (_super) {
    __extends(CircuitCommands, _super);
    function CircuitCommands() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CircuitCommands.prototype.createSetCircuitMessage = function (circuitId, circuitState) {
        this.messageId = 12530;
        this.createBaseMessage();
        // this.addHeader(this.senderId, this.messageId);
        // this._controllerId = controllerId;
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(circuitId + 499);
        this.writeInt32LE((circuitState ? 1 : 0) || 0);
        this.encode();
        return this.toBuffer();
    };
    CircuitCommands.prototype.createIntellibriteMessage = function (command) {
        this.messageId = 12556;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(command || 0);
        return this.toBuffer();
    };
    CircuitCommands.prototype.createSetCircuitRuntimeMessage = function (circuitId, runTime) {
        this.messageId = 12550;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(circuitId + 499);
        this.writeInt32LE(runTime);
        return this.toBuffer();
    };
    return CircuitCommands;
}(Commands));
exports.CircuitCommands = CircuitCommands;
var ChlorCommands = /** @class */ (function (_super) {
    __extends(ChlorCommands, _super);
    function ChlorCommands() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChlorCommands.prototype.createSetChlorOutputMessage = function (poolOutput, spaOutput) {
        this.messageId = 12576;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(poolOutput || 0);
        this.writeInt32LE(spaOutput || 0);
        this.writeInt32LE(0);
        this.writeInt32LE(0);
        return this.toBuffer();
    };
    ChlorCommands.prototype.createSaltCellConfigMessage = function () {
        this.messageId = 12572;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        return this.toBuffer();
    };
    return ChlorCommands;
}(Commands));
exports.ChlorCommands = ChlorCommands;
var ChemCommands = /** @class */ (function (_super) {
    __extends(ChemCommands, _super);
    function ChemCommands() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChemCommands.prototype.createChemStatusMessage = function () {
        this.messageId = 12592;
        this.createBaseMessage();
        this.writeInt32LE(0);
        return this.toBuffer();
    };
    ChemCommands.prototype.createGetChemHistoryMessage = function (fromTime, toTime) {
        this.messageId = 12596;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeSLDateTime(fromTime);
        this.writeSLDateTime(toTime);
        this.writeInt32LE(this.senderId || 0);
        return this.toBuffer();
    };
    return ChemCommands;
}(Commands));
exports.ChemCommands = ChemCommands;
var BodyCommands = /** @class */ (function (_super) {
    __extends(BodyCommands, _super);
    function BodyCommands() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BodyCommands.prototype.createSetPointMessage = function (bodyType, temperature) {
        this.messageId = 12528;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(bodyType || 0);
        this.writeInt32LE(temperature || 0);
        return this.toBuffer();
    };
    BodyCommands.prototype.createHeatModeMessage = function (bodyType, heatMode) {
        this.messageId = 12538;
        this.createBaseMessage();
        this.writeInt32LE(this.unit.controllerId);
        this.writeInt32LE(bodyType || 0);
        this.writeInt32LE(heatMode || 0);
        return this.toBuffer();
    };
    return BodyCommands;
}(Commands));
exports.BodyCommands = BodyCommands;
var ScheduleCommands = /** @class */ (function (_super) {
    __extends(ScheduleCommands, _super);
    function ScheduleCommands() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScheduleCommands.prototype.createGetSchedulesMessage = function (schedType) {
        this.messageId = 12542;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(schedType);
        return this.toBuffer();
    };
    ScheduleCommands.prototype.createAddScheduleEventMessage = function (schedType) {
        this.messageId = 12544;
        this.createBaseMessage();
        this.writeInt32LE(0);
        this.writeInt32LE(schedType);
        return this.toBuffer();
    };
    ScheduleCommands.prototype.createDeleteScheduleEventMessage = function (schedId) {
        this.messageId = 12546;
        this.createBaseMessage();
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(schedId + 699);
        return this.toBuffer();
    };
    ScheduleCommands.prototype.createSetScheduleEventMessage = function (scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint) {
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
    };
    return ScheduleCommands;
}(Commands));
exports.ScheduleCommands = ScheduleCommands;
var PumpCommands = /** @class */ (function (_super) {
    __extends(PumpCommands, _super);
    function PumpCommands() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PumpCommands.prototype.createPumpStatusMessage = function (pumpId) {
        this.messageId = 12584;
        this.createBaseMessage();
        this.writeInt32LE(this.controllerId);
        this.writeInt32LE(pumpId);
        return this.toBuffer();
    };
    PumpCommands.prototype.setPumpSpeed = function (pumpId, circuitId, speed, isRPM) {
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
    };
    return PumpCommands;
}(Commands));
exports.PumpCommands = PumpCommands;
var OutboundGateway = /** @class */ (function (_super) {
    __extends(OutboundGateway, _super);
    function OutboundGateway() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OutboundGateway.prototype.createSendGatewayMessage = function (systemName) {
        this.messageId = 18003; // SLSendGatewayDataMessage.MSG_ID;
        this.createBaseMessage();
        this.writeSLString(systemName);
        this.writeSLString(systemName);
        return this.toBuffer();
    };
    return OutboundGateway;
}(SLMessage_1.Outbound));
exports.OutboundGateway = OutboundGateway;
;
