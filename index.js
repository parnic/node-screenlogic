var dgram = require('dgram');
var net = require('net');
const EventEmitter = require('events');
const messages = require('./messages');

class FindUnits extends EventEmitter {
  constructor() {
    super();
    this.finder = dgram.createSocket('udp4');
    var _this = this;
    this.finder.on('message', function (message, remote) {
      _this.foundServer(message, remote);
    }).on('close', function() {
      console.log('finder closed');
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
    console.log('Found something');
    var server = {
      address: remote.address,
      type: message.readInt32LE(0),
      port: message.readInt16LE(8),
      gatewayType: message.readUInt8(10),
      gatewaySubtype: message.readUInt8(11),
      gatewayName: message.toString('utf8', 12, 28)
    };

    console.log('  type: ' + server.type + ', host: ' + server.address + ':' + server.port + ', identified as ' + server.gatewayName);
    if (server.type === 2) {
      this.emit('serverFound', server);
    }
  }

  sendServerBroadcast() {
    var message = new Uint8Array(8);
    message[0] = 1;
    this.finder.send(message, 0, message.length, 1444, "255.255.255.255");
    console.log("Looking for ScreenLogic hosts...");
  }

  close() {
    this.finder.close();
  }
}

class UnitConnection extends EventEmitter {
  constructor(server) {
    super();
    this.server = server;

    this.client = new net.Socket();
    var _this = this;
    this.client.on('data', function(msg) {
      _this.onClientMessage(msg);
    }).on('close', function(had_error) {
      console.log('unit connection closed');
    });
  }

  close() {
    this.client.end();
  }

  connect() {
    console.log("connecting...");
    var _this = this;
    this.client.connect(this.server.port, this.server.address, function() {
      _this.onConnected();
    });
  }

  onConnected() {
    console.log('connected');

    console.log('sending init message...');
    this.client.write('CONNECTSERVERHOST\r\n\r\n');

    console.log('sending challenge message...');
    this.client.write(new messages.SLChallengeMessage().toBuffer());
  }

  login() {
    console.log('sending login message...');
    this.client.write(new messages.SLLoginMessage().toBuffer());
  }

  getPoolStatus() {
    console.log('sending pool status query...');
    this.client.write(new messages.SLPoolStatusMessage().toBuffer());
  }

  getControllerConfig() {
    console.log('sending controller config query...');
    this.client.write(new messages.SLControllerConfigMessage().toBuffer());
  }

  getChemicalData() {
    console.log('sending chemical data query...');
    this.client.write(new messages.SLChemDataMessage().toBuffer());
  }

  getSaltCellConfig() {
    console.log('sending salt cell config query...');
    this.client.write(new messages.SLSaltCellConfigMessage().toBuffer());
  }

  getVersion() {
    console.log('sending version query...');
    this.client.write(new messages.SLVersionMessage().toBuffer());
  }

  onClientMessage(msg) {
    console.log('received message of length ' + msg.length);
    var msgType = msg.readInt16LE(2);
    if (msgType === 15) {
      console.log("  it's a challenge response");
      this.login();
    } else if (msgType === 28) {
      console.log("  it's a login response");
      this.emit('loggedIn');
    } else if (msgType === 12527) {
      console.log("  it's pool status");
      this.emit('poolStatus', new messages.SLPoolStatusMessage(msg));
    } else if (msgType === 12533) {
      console.log("  it's controller configuration");
      this.emit('controllerConfig', new messages.SLControllerConfigMessage(msg));
    } else if (msgType === 12593) {
      console.log("  it's chem data");
      this.emit('chemicalData', new messages.SLChemDataMessage(msg));
    } else if (msgType === 12573) {
      console.log("  it's salt cell config");
      this.emit('saltCellConfig', new messages.SLSaltCellConfigMessage(msg));
    } else if (msgType === 8121) {
      console.log("  it's version");
      this.emit('version', new messages.SLVersionMessage(msg));
    } else {
      console.log("  it's unknown. type: " + msgType);
    }
  }
}

/* debug print full buffer contents:
for (const value of buf.values()) {
  console.log(value.toString(16));
}
*/

module.exports = {
  FindUnits,
  UnitConnection
}
