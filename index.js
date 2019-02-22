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
        gatewayName: message.toString('utf8', 12, 28),
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
    this.client.on('data', function(msg) {
      _this.onClientMessage(msg);
    }).on('close', function(had_error) {
      // console.log('unit connection closed');
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

  setCircuitState(controllerId, circuitId, circuitState) {
    this.client.write(new messages.SLSetCircuitStateMessage(controllerId, circuitId, circuitState).toBuffer());
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
      case 13:
        // console.log("  it's a login failure.");
        this.emit('loginFailed');
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
};
