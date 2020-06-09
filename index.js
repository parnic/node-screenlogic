'use strict';

var dgram = require('dgram');
var net = require('net');
const EventEmitter = require('events');
const messages = require('./messages');
const Encoder = require('./PasswordEncoder').HLEncoder;
var debugFind = require('debug')('sl:find');
var debugRemote = require('debug')('sl:remote');
var debugUnit = require('debug')('sl:unit');

class FindUnits extends EventEmitter {
  constructor() {
    super();
    this.finder = dgram.createSocket('udp4');
    var _this = this;
    this.finder.on('message', function(message, remote) {
      _this.foundServer(message, remote);
    }).on('close', function() {
      debugFind('closed');
    }).on('error', function(e) {
      debugFind('error: %O', e);
      _this.emit('error', e);
    });
  }

  search() {
    var _this = this;
    this.finder.bind(function() {
      _this.finder.setBroadcast(true);
      _this.finder.setMulticastTTL(128);
      _this.sendServerBroadcast();
    });
  }

  foundServer(message, remote) {
    debugFind('found something');
    if (message.length >= 40) {
      var server = {
        address: remote.address,
        type: message.readInt32LE(0),
        port: message.readInt16LE(8),
        gatewayType: message.readUInt8(10),
        gatewaySubtype: message.readUInt8(11),
        gatewayName: message.toString('utf8', 12, 29),
      };

      debugFind('  type: ' + server.type + ', host: ' + server.address + ':' + server.port + ', identified as ' + server.gatewayName);
      if (server.type === 2) {
        this.emit('serverFound', server);
      }
    } else {
      debugFind('  unexpected message');
    }
  }

  sendServerBroadcast() {
    var message = Buffer.alloc(8);
    message[0] = 1;
    this.finder.send(message, 0, message.length, 1444, '255.255.255.255');
    debugFind('Looking for ScreenLogic hosts...');
  }

  close() {
    this.finder.close();
  }
}

class RemoteLogin extends EventEmitter {
  constructor(systemName) {
    super();

    this.systemName = systemName;
    this.client = new net.Socket();
    var _this = this;
    this.client.on('data', function(msg) {
      _this.onClientMessage(msg);
    }).on('close', function(had_error) {
      debugRemote('remote login server connection closed');
    }).on('error', function(e) {
      debugRemote('error: %o', e);
      _this.emit('error', e);
    });
  }

  connect() {
    debugRemote('connecting to dispatcher...');
    var _this = this;
    this.client.connect(500, 'screenlogicserver.pentair.com', function() {
      _this.onConnected();
    });
  }

  onConnected() {
    debugRemote('connected to dispatcher');

    this.client.write(new messages.SLGetGatewayDataMessage(this.systemName).toBuffer());
  }

  onClientMessage(msg) {
    debugRemote('received message of length ' + msg.length);
    if (msg.length < 4) {
      return;
    }

    var msgType = msg.readInt16LE(2);
    switch (msgType) {
      case messages.SLGetGatewayDataMessage.getResponseId():
        debugRemote("  it's a gateway response");
        this.emit('gatewayFound', new messages.SLGetGatewayDataMessage(msg));
        break;
      default:
        debugRemote("  it's unknown. type: " + msgType);
        break;
    }
  }

  close() {
    this.client.end();
  }
}

class UnitConnection extends EventEmitter {
  constructor(server, address, password) {
    super();
    if (typeof server === 'object') {
      this.serverPort = server.port;
      this.serverAddress = server.address;
    } else {
      this.serverPort = server;
      this.serverAddress = address;
    }

    this.password = password;
    this.client = new net.Socket();
    var _this = this;
    var buffer = Buffer.alloc(1024);
    var bufferIdx = 0;
    var expectedMsgLen = 0;

    this.client.on('data', function(msg) {
      if (buffer.length < msg.length + bufferIdx) {
        buffer = Buffer.alloc(msg.length + buffer.length, buffer);
      }

      if (bufferIdx === 0) {
        expectedMsgLen = msg.readInt32LE(4) + 8;
      }

      msg.copy(buffer, bufferIdx);
      bufferIdx = bufferIdx + msg.length;

      if (bufferIdx === expectedMsgLen) {
        _this.onClientMessage(buffer.slice(0, expectedMsgLen));
        bufferIdx = 0;
      }
    }).on('close', function(had_error) {
      debugUnit('closed');
    }).on('error', function(e) {
      debugUnit('error: %o', e);
      _this.emit('error', e);
    });
  }

  close() {
    this.client.end();
  }

  connect() {
    debugUnit('connecting...');
    var _this = this;
    this.client.connect(this.serverPort, this.serverAddress, function() {
      _this.onConnected();
    });
  }

  onConnected() {
    debugUnit('connected');

    debugUnit('sending init message...');
    this.client.write('CONNECTSERVERHOST\r\n\r\n');

    debugUnit('sending challenge message...');
    this.client.write(new messages.SLChallengeMessage().toBuffer());
  }

  login() {
    debugUnit('sending login message...');
    var password = new Encoder(this.password).getEncryptedPassword(this.challengeString);
    this.client.write(new messages.SLLoginMessage(password).toBuffer());
  }

  getPoolStatus() {
    debugUnit('sending pool status query...');
    this.client.write(new messages.SLPoolStatusMessage().toBuffer());
  }

  getControllerConfig() {
    debugUnit('sending controller config query...');
    this.client.write(new messages.SLControllerConfigMessage().toBuffer());
  }

  getChemicalData() {
    debugUnit('sending chemical data query...');
    this.client.write(new messages.SLChemDataMessage().toBuffer());
  }

  getSaltCellConfig() {
    debugUnit('sending salt cell config query...');
    this.client.write(new messages.SLSaltCellConfigMessage().toBuffer());
  }

  getVersion() {
    debugUnit('sending version query...');
    this.client.write(new messages.SLVersionMessage().toBuffer());
  }

  getEquipmentConfiguration() {
    debugUnit('sending equipment configuration query...');
    this.client.write(new messages.SLEquipmentConfigurationMessage().toBuffer());
  }

  setCircuitState(controllerId, circuitId, circuitState) {
    debugUnit('sending set circuit state command: controllerId: %d, circuitId: %d, circuitState: %d...', controllerId, circuitId, circuitState);
    this.client.write(new messages.SLSetCircuitStateMessage(controllerId, circuitId, circuitState).toBuffer());
  }

  setSetPoint(controllerId, bodyType, temperature) {
    debugUnit('sending set setpoint command: controllerId: %d, bodyType: %d, temperature: %d...', controllerId, bodyType, temperature);
    this.client.write(new messages.SLSetHeatSetPointMessage(controllerId, bodyType, temperature).toBuffer());
  }

  setHeatMode(controllerId, bodyType, heatMode) {
    debugUnit('sending set heatmode command: controllerId: %d, bodyType: %d, heatMode: %d...', controllerId, bodyType, heatMode);
    this.client.write(new messages.SLSetHeatModeMessage(controllerId, bodyType, heatMode).toBuffer());
  }

  sendLightCommand(controllerId, command) {
    debugUnit('sending light command: controllerId: %d, command: %d...', controllerId, command);
    this.client.write(new messages.SLLightControlMessage(controllerId, command).toBuffer());
  }

  setSaltCellOutput(controllerId, poolOutput, spaOutput) {
    debugUnit('sending set saltcell output command: controllerId: %d, poolOutput: %d, spaOutput: %d...', controllerId, poolOutput, spaOutput);
    this.client.write(new messages.SLSetSaltCellConfigMessage(controllerId, poolOutput, spaOutput).toBuffer());
  }

  getScheduleData(scheduleType) {
    debugUnit('sending set schedule data query for scheduleType: %d...', scheduleType);
    this.client.write(new messages.SLGetScheduleData(null, scheduleType).toBuffer());
  }

  addNewScheduleEvent(scheduleType) {
    debugUnit('sending add new schedule event command for scheduleType: %d...', scheduleType);
    this.client.write(new messages.SLAddNewScheduleEvent(null, scheduleType).toBuffer());
  }

  deleteScheduleEventById(scheduleId) {
    debugUnit('sending delete schedule event command for scheduleId: %d...', scheduleId);
    this.client.write(new messages.SLDeleteScheduleEventById(scheduleId).toBuffer());
  }

  // todo: should this just accept a SLSetScheduleEventById message instead of all these args?
  setScheduleEventById(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint) {
    debugUnit('sending set schedule event command for scheduleId: %d, circuitId: %d, startTime: %d, stopTime: %d, dayMask: %d, flags: %d, heatCmd: %d, heatSetPoint: %d...', scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint);
    this.client.write(new messages.SLSetScheduleEventById(null, scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint).toBuffer());
  }

  setCircuitRuntimebyId(circuitId, runTime) {
    debugUnit('sending set circuit runtime command for circuitId: %d, runTime: %d...', circuitId, runTime);
    this.client.write(new messages.SLSetCircuitRuntimeById(circuitId, runTime).toBuffer());
  }

  getPumpStatus(pumpId) {
    debugUnit('sending get pump status command for pumpId: %d...', pumpId);
    this.client.write(new messages.SLGetPumpStatus(null, pumpId).toBuffer());
  }

  setPumpFlow(pumpId, circuitId, setPoint, isRPMs) {
    debugUnit('sending set pump flow command for pumpId: %d, circuitId: %d, setPoint: %d, isRPMs: %d...', pumpId, circuitId, setPoint, isRPMs);
    this.client.write(new messages.SLSetPumpFlow(pumpId, circuitId, setPoint, isRPMs).toBuffer());
  }

  cancelDelay() {
    debugUnit('sending cancel delay command...');
    this.client.write(new messages.SLCancelDelay().toBuffer());
  }

  addClient() {
    debugUnit('sending add client command...');
    this.client.write(new messages.SLAddClient().toBuffer());
  }

  removeClient() {
    debugUnit('sending remove client command...');
    this.client.write(new messages.SLRemoveClient().toBuffer());
  }

  onClientMessage(msg) {
    debugUnit('received message of length %d', msg.length);
    if (msg.length < 4) {
      return;
    }

    var msgType = msg.readInt16LE(2);
    switch (msgType) {
      case messages.SLChallengeMessage.getResponseId():
        debugUnit("  it's a challenge response");
        this.challengeString = new messages.SLChallengeMessage(msg).challengeString;
        this.login();
        break;
      case messages.SLLoginMessage.getResponseId():
        debugUnit("  it's a login response");
        this.emit('loggedIn');
        break;
      case messages.SLPoolStatusMessage.getResponseId():
        debugUnit("  it's pool status");
        this.emit('poolStatus', new messages.SLPoolStatusMessage(msg));
        break;
      case messages.SLControllerConfigMessage.getResponseId():
        debugUnit("  it's controller configuration");
        this.emit('controllerConfig', new messages.SLControllerConfigMessage(msg));
        break;
      case messages.SLChemDataMessage.getResponseId():
        debugUnit("  it's chem data");
        this.emit('chemicalData', new messages.SLChemDataMessage(msg));
        break;
      case messages.SLSaltCellConfigMessage.getResponseId():
        debugUnit("  it's salt cell config");
        this.emit('saltCellConfig', new messages.SLSaltCellConfigMessage(msg));
        break;
      case messages.SLVersionMessage.getResponseId():
        debugUnit("  it's version");
        this.emit('version', new messages.SLVersionMessage(msg));
        break;
      case messages.SLSetCircuitStateMessage.getResponseId():
        debugUnit("  it's circuit toggle ack");
        this.emit('circuitStateChanged', new messages.SLSetCircuitStateMessage());
        break;
      case messages.SLSetHeatSetPointMessage.getResponseId():
        debugUnit("  it's a setpoint ack");
        this.emit('setPointChanged', new messages.SLSetHeatSetPointMessage());
        break;
      case messages.SLSetHeatModeMessage.getResponseId():
        debugUnit("  it's a heater mode ack");
        this.emit('heatModeChanged', new messages.SLSetHeatModeMessage());
        break;
      case messages.SLLightControlMessage.getResponseId():
        debugUnit("  it's a light control ack");
        this.emit('sentLightCommand', new messages.SLLightControlMessage());
        break;
      case messages.SLSetSaltCellConfigMessage.getResponseId():
        debugUnit("  it's a set salt cell config ack");
        this.emit('setSaltCellConfig', new messages.SLSetSaltCellConfigMessage());
        break;
      case messages.SLEquipmentConfigurationMessage.getResponseId():
        debugUnit("  it's equipment configuration");
        this.emit('equipmentConfiguration', new messages.SLEquipmentConfigurationMessage(msg));
        break;
      case messages.SLGetScheduleData.getResponseId():
        debugUnit("  it's schedule data");
        this.emit('getScheduleData', new messages.SLGetScheduleData(msg));
        break;
      case messages.SLAddNewScheduleEvent.getResponseId():
        debugUnit("  it's a new schedule event ack");
        this.emit('addNewScheduleEvent', new messages.SLAddNewScheduleEvent(msg));
        break;
      case messages.SLDeleteScheduleEventById.getResponseId():
        debugUnit("  it's a delete schedule event ack");
        this.emit('deleteScheduleEventById', new messages.SLDeleteScheduleEventById(msg));
        break;
      case messages.SLSetScheduleEventById.getResponseId():
        debugUnit("  it's a set schedule event ack");
        this.emit('setScheduleEventById', new messages.SLSetScheduleEventById(msg));
        break;
      case messages.SLSetCircuitRuntimeById.getResponseId():
        debugUnit("  it's a set circuit runtime ack");
        this.emit('setCircuitRuntimebyId', new messages.SLSetCircuitRuntimeById());
        break;
      case messages.SLGetPumpStatus.getResponseId():
        debugUnit("  it's pump status");
        this.emit('getPumpStatus', new messages.SLGetPumpStatus(msg));
        break;
      case messages.SLSetPumpFlow.getResponseId():
        debugUnit("  it's a set pump flow ack");
        this.emit('setPumpFlow', new messages.SLSetPumpFlow());
        break;
      case messages.SLCancelDelay.getResponseId():
        debugUnit("  it's a cancel delay ack");
        this.emit('cancelDelay', new messages.SLCancelDelay());
        break;
      case messages.SLAddClient.getResponseId():
        debugUnit("  it's an add client ack");
        this.emit('addClient', new messages.SLCancelDelay());
        break;
      case messages.SLRemoveClient.getResponseId():
        debugUnit("  it's a remove client ack");
        this.emit('removeClient', new messages.SLCancelDelay());
        break;
      case 12500: // This is the message received when you are registered as a client, the data is the same as a pool status message
        debugUnit("  it's pool status");
        this.emit('poolStatus', new messages.SLPoolStatusMessage(msg));
        break;
      case 13:
        debugUnit("  it's a login failure.");
        this.emit('loginFailed');
        break;
      case 30:
        debugUnit("  it's an unknown command.");
        this.emit('unknownCommand');
        break;
      case 31:
        debugUnit("  it's a parameter failure.");
        this.emit('badParameter');
        break;
      default:
        debugUnit("  it's an unknown type: %d", msgType);
        break;
    }
  }
}

/* debug print full buffer contents:
for (const value of buf.values()) {
  //console.log(value.toString(16));
}
*/

module.exports = {
  FindUnits,
  RemoteLogin,
  UnitConnection,
  LIGHT_CMD_LIGHTS_OFF: 0,
  LIGHT_CMD_LIGHTS_ON: 1,
  LIGHT_CMD_COLOR_SET: 2,
  LIGHT_CMD_COLOR_SYNC: 3,
  LIGHT_CMD_COLOR_SWIM: 4,
  LIGHT_CMD_COLOR_MODE_PARTY: 5,
  LIGHT_CMD_COLOR_MODE_ROMANCE: 6,
  LIGHT_CMD_COLOR_MODE_CARIBBEAN: 7,
  LIGHT_CMD_COLOR_MODE_AMERICAN: 8,
  LIGHT_CMD_COLOR_MODE_SUNSET: 9,
  LIGHT_CMD_COLOR_MODE_ROYAL: 10,
  LIGHT_CMD_COLOR_SET_SAVE: 11,
  LIGHT_CMD_COLOR_SET_RECALL: 12,
  LIGHT_CMD_COLOR_BLUE: 13,
  LIGHT_CMD_COLOR_GREEN: 14,
  LIGHT_CMD_COLOR_RED: 15,
  LIGHT_CMD_COLOR_WHITE: 16,
  LIGHT_CMD_COLOR_PURPLE: 17,
  HEAT_MODE_OFF: 0,
  HEAT_MODE_SOLAR: 1,
  HEAT_MODE_SOLARPREFERRED: 2,
  HEAT_MODE_HEATPUMP: 3,
  HEAT_MODE_DONTCHANGE: 4,
  PUMP_TYPE_INTELLIFLOVF: 1,
  PUMP_TYPE_INTELLIFLOVS: 2,
  PUMP_TYPE_INTELLIFLOVSF: 3,
};
