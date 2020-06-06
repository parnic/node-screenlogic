'use strict';

var dgram = require('dgram');
var net = require('net');
const EventEmitter = require('events');
const messages = require('./messages');
const Encoder = require('./PasswordEncoder').HLEncoder;

class FindUnits extends EventEmitter {
  constructor() {
    super();
    this.finder = dgram.createSocket('udp4');
    var _this = this;
    this.finder.on('message', function(message, remote) {
      _this.foundServer(message, remote);
    }).on('close', function() {
      // console.log('finder closed');
    }).on('error', function(e) {
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
    // console.log('Found something');
    if (message.length >= 40) {
      var server = {
        address: remote.address,
        type: message.readInt32LE(0),
        port: message.readInt16LE(8),
        gatewayType: message.readUInt8(10),
        gatewaySubtype: message.readUInt8(11),
        gatewayName: message.toString('utf8', 12, 29),
      };

      // console.log('  type: ' + server.type + ', host: ' + server.address + ':' + server.port + ',
      //   identified as ' + server.gatewayName);
      if (server.type === 2) {
        this.emit('serverFound', server);
      }
    }
  }

  sendServerBroadcast() {
    var message = Buffer.alloc(8);
    message[0] = 1;
    this.finder.send(message, 0, message.length, 1444, '255.255.255.255');
    // console.log("Looking for ScreenLogic hosts...");
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
      // console.log('remote login server connection closed');
    }).on('error', function(e) {
      _this.emit('error', e);
    });
  }

  connect() {
    // console.log('connecting to dispatcher...');
    var _this = this;
    this.client.connect(500, 'screenlogicserver.pentair.com', function() {
      _this.onConnected();
    });
  }

  onConnected() {
    // console.log('connected to dispatcher');

    this.client.write(new messages.SLGetGatewayDataMessage(this.systemName).toBuffer());
  }

  onClientMessage(msg) {
    // console.log('received message of length ' + msg.length);
    if (msg.length < 4) {
      return;
    }

    var msgType = msg.readInt16LE(2);
    switch (msgType) {
      case messages.SLGetGatewayDataMessage.getResponseId():
        // console.log("  it's a gateway response");
        this.emit('gatewayFound', new messages.SLGetGatewayDataMessage(msg));
        break;
      default:
        // console.log("  it's unknown. type: " + msgType);
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
      // console.log('unit connection closed');
    }).on('error', function(e) {
      _this.emit('error', e);
    });
  }

  close() {
    this.client.end();
  }

  connect() {
    // console.log("connecting...");
    var _this = this;
    this.client.connect(this.serverPort, this.serverAddress, function() {
      _this.onConnected();
    });
  }

  onConnected() {
    // console.log('connected');

    // console.log('sending init message...');
    this.client.write('CONNECTSERVERHOST\r\n\r\n');

    // console.log('sending challenge message...');
    this.client.write(new messages.SLChallengeMessage().toBuffer());
  }

  login() {
    // console.log('sending login message...');
    var password = new Encoder(this.password).getEncryptedPassword(this.challengeString);
    this.client.write(new messages.SLLoginMessage(password).toBuffer());
  }

  getPoolStatus() {
    // console.log('sending pool status query...');
    this.client.write(new messages.SLPoolStatusMessage().toBuffer());
  }

  getControllerConfig() {
    // console.log('sending controller config query...');
    this.client.write(new messages.SLControllerConfigMessage().toBuffer());
  }

  getChemicalData() {
    // console.log('sending chemical data query...');
    this.client.write(new messages.SLChemDataMessage().toBuffer());
  }

  getSaltCellConfig() {
    // console.log('sending salt cell config query...');
    this.client.write(new messages.SLSaltCellConfigMessage().toBuffer());
  }

  getVersion() {
    // console.log('sending version query...');
    this.client.write(new messages.SLVersionMessage().toBuffer());
  }

  getEquipmentConfiguration() {
    this.client.write(new messages.SLEquipmentConfigurationMessage().toBuffer());
  }

  setCircuitState(controllerId, circuitId, circuitState) {
    this.client.write(new messages.SLSetCircuitStateMessage(controllerId, circuitId, circuitState).toBuffer());
  }

  setSetPoint(controllerId, bodyType, temperature) {
    this.client.write(new messages.SLSetHeatSetPointMessage(controllerId, bodyType, temperature).toBuffer());
  }

  setHeatMode(controllerId, bodyType, heatMode) {
    this.client.write(new messages.SLSetHeatModeMessage(controllerId, bodyType, heatMode).toBuffer());
  }

  sendLightCommand(controllerId, command) {
    this.client.write(new messages.SLLightControlMessage(controllerId, command).toBuffer());
  }

  setSaltCellOutput(controllerId, poolOutput, spaOutput) {
    this.client.write(new messages.SLSetSaltCellConfigMessage(controllerId, poolOutput, spaOutput).toBuffer());
  }

  getScheduleData(scheduleType) {
    this.client.write(new messages.SLGetScheduleData(null, scheduleType).toBuffer());
  }

  addNewScheduleEvent(scheduleType) {
    this.client.write(new messages.SLAddNewScheduleEvent(null, scheduleType).toBuffer());
  }

  deleteScheduleEventById(scheduleId) {
    this.client.write(new messages.SLDeleteScheduleEventById(scheduleId).toBuffer());
  }

  setScheduleEventById(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint) {
    this.client.write(new messages.SLSetScheduleEventById(null, scheduleId, circuitId, startTime, stopTime,
      dayMask, flags, heatCmd, heatSetPoint).toBuffer());
  }

  setCircuitRuntimebyId(circuitId, runTime) {
    this.client.write(new messages.SLSetCircuitRuntimeById(circuitId, runTime).toBuffer());
  }

  onClientMessage(msg) {
    // console.log('received message of length ' + msg.length);
    if (msg.length < 4) {
      return;
    }

    var msgType = msg.readInt16LE(2);
    switch (msgType) {
      case messages.SLChallengeMessage.getResponseId():
        // console.log("  it's a challenge response");
        this.challengeString = new messages.SLChallengeMessage(msg).challengeString;
        this.login();
        break;
      case messages.SLLoginMessage.getResponseId():
        // console.log("  it's a login response");
        this.emit('loggedIn');
        break;
      case messages.SLPoolStatusMessage.getResponseId():
        // console.log("  it's pool status");
        this.emit('poolStatus', new messages.SLPoolStatusMessage(msg));
        break;
      case messages.SLControllerConfigMessage.getResponseId():
        // console.log("  it's controller configuration");
        this.emit('controllerConfig', new messages.SLControllerConfigMessage(msg));
        break;
      case messages.SLChemDataMessage.getResponseId():
        // console.log("  it's chem data");
        this.emit('chemicalData', new messages.SLChemDataMessage(msg));
        break;
      case messages.SLSaltCellConfigMessage.getResponseId():
        // console.log("  it's salt cell config");
        this.emit('saltCellConfig', new messages.SLSaltCellConfigMessage(msg));
        break;
      case messages.SLVersionMessage.getResponseId():
        // console.log("  it's version");
        this.emit('version', new messages.SLVersionMessage(msg));
        break;
      case messages.SLSetCircuitStateMessage.getResponseId():
        // console.log("  it's circuit toggle ack");
        this.emit('circuitStateChanged', new messages.SLSetCircuitStateMessage());
        break;
      case messages.SLSetHeatSetPointMessage.getResponseId():
        // console.log("  it's a setpoint ack");
        this.emit('setPointChanged', new messages.SLSetHeatSetPointMessage());
        break;
      case messages.SLSetHeatModeMessage.getResponseId():
        // console.log("  it's a heater mode ack");
        this.emit('heatModeChanged', new messages.SLSetHeatModeMessage());
        break;
      case messages.SLLightControlMessage.getResponseId():
        // console.log("  it's a light control ack");
        this.emit('sentLightCommand', new messages.SLLightControlMessage());
        break;
      case messages.SLSetSaltCellConfigMessage.getResponseId():
        // console.log("  it's a set salt cell config ack");
        this.emit('setSaltCellConfig', new messages.SLSetSaltCellConfigMessage());
        break;
      case messages.SLEquipmentConfigurationMessage.getResponseId():
        this.emit('equipmentConfiguration', new messages.SLEquipmentConfigurationMessage(msg));
        break;
      case messages.SLGetScheduleData.getResponseId():
        this.emit('getScheduleData', new messages.SLGetScheduleData(msg));
        break;
      case messages.SLAddNewScheduleEvent.getResponseId():
        this.emit('addNewScheduleEvent', new messages.SLAddNewScheduleEvent(msg));
        break;
      case messages.SLDeleteScheduleEventById.getResponseId():
        this.emit('deleteScheduleEventById', new messages.SLDeleteScheduleEventById(msg));
        break;
      case messages.SLSetScheduleEventById.getResponseId():
        this.emit('setScheduleEventById', new messages.SLSetScheduleEventById(msg));
        break;
      case messages.SLSetCircuitRuntimeById.getResponseId():
        this.emit('setCircuitRuntimebyId', new messages.SLSetCircuitRuntimeById());
        break;
      case 13:
        // console.log("  it's a login failure.");
        this.emit('loginFailed');
        break;
      case 31:
        // console.log("  it's a parameter failure.");
        this.emit('badParameter');
        break;
      default:
        // console.log("  it's unknown. type: " + msgType);
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
};
