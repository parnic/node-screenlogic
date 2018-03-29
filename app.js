var dgram = require('dgram'); 
var net = require('net');

var server = dgram.createSocket("udp4"); 
server.bind( function() {
  server.setBroadcast(true)
  server.setMulticastTTL(128);
  broadcastNew();
});

server.on('message', function (message, remote) {
  console.log('Got a response.');
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
    connectTo(server);
  }
});

function broadcastNew() {
  var message = new Uint8Array(8);
  message[0] = 1;
  server.send(message, 0, message.length, 1444, "255.255.255.255");
  console.log("Looking for ScreenLogic hosts...");
}

function connectTo(server) {
  console.log("connecting...");
  var client = new net.Socket();
  client.connect(server.port, server.address, function() {
    console.log('connected');

    console.log('sending connection string...');
    var buf = Buffer.from('CONNECTSERVERHOST\r\n\r\n');
    client.write(buf);

    console.log('sending challenge string...');
    buf = Buffer.alloc(8);
    buf.writeUInt16LE(14, 2);
    client.write(buf);

    console.log('sending login string...');
    buf = Buffer.alloc(72);
    buf.writeUInt16LE(0);
    buf.writeUInt16LE(27, 2);
    buf.writeInt32LE(64, 4); // length
    buf.writeInt32LE(348, 8); // schema
    buf.writeInt32LE(0, 12); // connection type
    var name = 'ScreenLogicConnect library';
    buf.writeInt32LE(name.length, 16);
    buf.write(name, 20);
    var pos = 20 + name.length;
    for (var i = 0; i < 4 - (name.length % 4); i++) {
      buf.writeUInt8(0, 20 + name.length + i);
      pos = pos + 1;
    }
    buf.writeInt32LE(16, pos);
    pos += 4;
    pos += 16;
    buf.writeInt32LE(2, pos);
    client.write(buf);

    console.log('sending pool status query...');
    buf = Buffer.alloc(12);
    buf.writeUInt16LE(12526, 2);
    buf.writeInt32LE(4, 4);
    client.write(buf);

    console.log('sending controller config query...');
    buf = Buffer.alloc(16);
    buf.writeUInt16LE(12532, 2);
    buf.writeInt32LE(8, 4);
    client.write(buf);

    setTimeout(function() {
      console.log('destroying');
      client.destroy();
    }, 3000);
  });

  client.on('close', function() {
    console.log('closed');
  });

  client.on('data', function(msg) {
    console.log('received message of length ' + msg.length);
    var msgType = msg.readInt16LE(2);
    if (msgType === 15) {
      console.log("  it's a challenge response");
    } else if (msgType === 28) {
      console.log("  it's a login response");
    } else if (msgType === 12527) {
      console.log("  it's pool status");
    } else if (msgType === 12533) {
      console.log("  it's controller configuration");
    }
  });
}

/* debug print full buffer contents:
for (const value of buf.values()) {
  console.log(value.toString(16));
}
*/
