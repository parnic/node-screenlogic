'use strict';

import 'source-map-support/register'
var dgram = require('dgram');
import * as net from 'net';
import { EventEmitter } from 'events';
import * as SLGateway from './messages/SLGatewayDataMessage';

import { BodyCommands, ChemCommands, ChlorCommands, CircuitCommands, ConnectionCommands, EquipmentCommands, OutboundGateway, PumpCommands, ScheduleCommands } from './messages/OutgoingMessages';
import { ConnectionMessage } from './messages/ConnectionMessage';
// import { Inbound } from './messages/SLMessage';
import { EquipmentConfigurationMessage, rawData, SLControllerConfigData, SLEquipmentConfigurationData, SLHistoryData, SLWeatherForecastData } from './messages/config/EquipmentConfig';
import { ChlorMessage, SLIntellichlorData } from './messages/state/ChlorMessage';
import { ChemMessage, SLChemData, SLChemHistory } from './messages/state/ChemMessage';
import { ScheduleMessage, SLScheduleData } from './messages/config/ScheduleMessage';
import { PumpMessage, SLPumpStatusData } from './messages/state/PumpMessage';
import { CircuitMessage } from './messages/config/CircuitMessage';
import { HeaterMessage } from './messages/config/HeaterMessage';
import { Inbound } from './messages/SLMessage';
import { EquipmentStateMessage, SLEquipmentStateData, SLSystemTimeData } from './messages/state/EquipmentState';
const Encoder = require('./utils/PasswordEncoder').HLEncoder;
var debugFind = require('debug')('sl:find');
var debugRemote = require('debug')('sl:remote');
var debugUnit = require('debug')('sl:unit');
import { setTimeout } from "timers/promises";
import { setTimeout as setTimeoutSync } from "timers";
import { Socket } from 'dgram';
export class FindUnits extends EventEmitter {
  constructor() {
    super();

    this.message = Buffer.alloc(8);
    this.message[0] = 1;

    this.finder = dgram.createSocket('udp4');
    var self = this;
    this.finder.on('listening', function () {
      self.finder.setBroadcast(true);
      self.finder.setMulticastTTL(128);

      if (!self.bound) {
        self.bound = true;
        self.sendServerBroadcast();
      }
    }).on('message', function (msg, remote) {
      self.foundServer(msg, remote);
    }).on('close', function () {
      debugFind('closed');
      self.emit('close');
    }).on('error', function (e) {
      debugFind('error: %O', e);
      self.emit('error', e);
    });
  }
  private finder: Socket;
  private bound: boolean;
  private message: Buffer;
  search() {
    if (!this.bound) {
      this.finder.bind();
    } else {
      this.sendServerBroadcast();
    }
  }

  public async searchAsync():Promise<LocalUnit[]> {
    let self = this;
    return new Promise(async (resolve, reject) => {
      try {
        let units: LocalUnit[] = [];
        debugFind(`Screenlogic finder searching for local units...`,);
        setTimeoutSync(() => {
          if (units.length === 0) debugFind(`No units found searching locally.`)
          self.removeAllListeners();
          resolve(units);
        }, 5000);
        self.on('serverFound', (unit) => {
          debugFind(`Screenlogic found unit ${JSON.stringify(unit)}`);
          units.push(unit);
        })
      } catch (error) {
        debugFind(`Screenlogic caught searchAsync error ${error.message}, rethrowing...`);
        throw error;
      }
      self.search();
    });
  }

  foundServer(msg, remote) {
    debugFind('found something');
    if (msg.length >= 40) {
      var server: LocalUnit = {
        address: remote.address,
        type: msg.readInt32LE(0),
        port: msg.readInt16LE(8),
        gatewayType: msg.readUInt8(10),
        gatewaySubtype: msg.readUInt8(11),
        gatewayName: msg.toString('utf8', 12, 29),
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
    this.finder.send(this.message, 0, this.message.length, 1444, '255.255.255.255');
    debugFind('Looking for ScreenLogic hosts...');
  }

  public close() {
    this.finder.close();
  }
}

export class RemoteLogin extends EventEmitter {
  constructor(systemName) {
    super();

    this.systemName = systemName;
    this._client = new net.Socket();
    this._gateway = new OutboundGateway(0, 0); // controllerid, senderid

  }
  public systemName: string;
  private _client: net.Socket;
  private _gateway: OutboundGateway;


  public async connectAsync(): Promise<SLGateway.SLGateWayData> {
    var self = this;
    return new Promise((resolve, reject) => {
      debugRemote('connecting to dispatcher...');
      self._client.on('data', function (buf) {
        // _this.onClientMessage(msg);

        if (buf.length > 4) {
          let message = new Inbound(screenlogic.controllerId, screenlogic.senderId);
          message.readFromBuffer(buf);
          var msgType = buf.readInt16LE(2);
          debugRemote(`received message of length ${buf.length} and messageId ${message.action}`);
          switch (message.action) {
            case 18004: // SLGatewayDataMessage.getResponseId():
              debugRemote("  it's a gateway response");
              if (typeof resolve !== 'undefined') {
                let unit = new SLGateway.SLReceiveGatewayDataMessage(buf).get();
                resolve(unit);
              }
              else
                self.emit('gatewayFound', new SLGateway.SLReceiveGatewayDataMessage(buf));
              break;
            default:
              debugRemote("  it's unknown. type: " + msgType);
              if (typeof reject !== 'undefined') {
                reject(new Error(`Message on unknown type (${msgType}) received.`));
              }
              break;
          }
        }
        else {
          debugRemote("   message of length <= 4 received and is not valid")
          if (typeof reject !== 'undefined') {
            reject(new Error(`Message of length <= 4 is invalid.`));
          }
        }
        self.closeAsync().catch((err) => {
          debugRemote(`Error with closeAsync: ${err.message};`);
        });
      }).on('close', function (had_error) {
        debugRemote('Gateway server connection closed (close emit)');
        self.emit('close', had_error);
      }).on('error', function (e) {
        debugRemote('error: %o', e);
        if (typeof reject !== 'undefined') {
          reject(e);
        }
        else
          self.emit('error', e);
      });

      self._client.connect(500, 'screenlogicserver.pentair.com', function () {
        debugRemote('connected to dispatcher');
        self._client.write(self._gateway.createSendGatewayMessage(self.systemName));
      })
    }
    )
  };

  public async closeAsync() {
    let self = this;
    return new Promise(async (resolve, reject) => {
      debugRemote(`Gateway request to close.`);
      self._client.end(() => {
        debugRemote(`Gateway closed`);
        resolve(true);
      });
    });

  }
}

export class UnitConnection extends EventEmitter {
  constructor() {
    super();
    this._buffer = Buffer.alloc(1024);
    this._bufferIdx = 0;
  }
  public systemName: string;
  private serverPort: number;
  private serverAddress: string;
  private password: string;
  protected client: net.Socket;
  private isConnected: boolean = false;
  private _clientId: number;
  public get clientId(): number { return this._clientId };
  public set clientId(val: number) { this._clientId = val; }
  private _controllerId: number = 0;
  public get controllerId(): number { return this._controllerId };
  public set controllerId(val: number) { this._controllerId = val; }
  public static controllerType: number = 0; // for set equip message decode
  public static expansionsCount: number = 0; // for set equip message decode
  protected _isMock: boolean = false;

  private _buffer: Buffer;
  private _bufferIdx: number;
  // private _expectedMsgLen: number;
  // private challengeString;
  private _senderId = 0;
  public get senderId(): number { return this._senderId };
  public set senderId(val: number) { this._senderId = val; }
  // public SLMessages = slmessage;
  public controller: Controller;
  public netTimeout: number = 2500;  // set back to 1s after testing
  private _keepAliveDuration: number = 30 * 1000;
  private _keepAliveTimer: NodeJS.Timeout;
  private _expectedMsgLen: number;
  public circuits: Circuit;
  public equipment: Equipment;
  public bodies: Body;
  public chem: Chem;
  public chlor: Chlor;
  public schedule: Schedule;
  public pump: Pump;
  public reconnectAsync = async () => {
    try {

      let self = this;
      debugUnit(`Unit had an unexpected error/timeout/clientError - reconnecting.`)
      self.client.removeAllListeners();
      // await setTimeout(1000);
      await self.closeAsync();
      await self.connectAsync();
    }
    catch (err) {
      debugUnit(`Error trying to reconnect: ${err.message}`);
    }
  }
  public initMock(systemName: string, address: string, port: number, password: string, senderId?: number) {
    this.systemName = systemName;
    this.serverPort = port;
    this.serverAddress = address;
    this.password = password;
    this.senderId = typeof senderId !== 'undefined' ? senderId : Math.min(Math.max(1, Math.trunc(Math.random() * 10000)), 10000);
    this.clientId = Math.round(Math.random() * 100000);
    this._initCommands();
    this._isMock = true;
  }
  public init(systemName: string, address: string, port: number, password: string, senderId?: number) {
    let self = this;
    this.systemName = systemName;
    this.serverPort = port;
    this.serverAddress = address;
    this.password = password;
    this.senderId = typeof senderId !== 'undefined' ? senderId : Math.min(Math.max(1, Math.trunc(Math.random() * 10000)), 10000);
    this.clientId = Math.round(Math.random() * 100000);
    this._initCommands();
    this._isMock = false;
    this._keepAliveTimer = setTimeoutSync(() => {
      self.keepAliveAsync()
    }, this._keepAliveDuration || 30000
    );
  }
  private _initCommands() {
    this.controller = {
      circuits: new CircuitCommands(this),
      connection: new ConnectionCommands(this),
      equipment: new EquipmentCommands(this),
      chlor: new ChlorCommands(this),
      chem: new ChemCommands(this),
      schedules: new ScheduleCommands(this),
      pumps: new PumpCommands(this),
      bodies: new BodyCommands(this)
    };
    this.circuits = new Circuit();
    this.equipment = new Equipment();
    this.bodies = new Body();
    this.chem = new Chem();
    this.chlor = new Chlor();
    this.schedule = new Schedule();
    this.pump = new Pump();
  }
  public write(bytes: Buffer | string) {
    if (this._isMock) { debugUnit(`Skipping write because of mock port`) };
    try {
      if (!this.client.writable) {
        debugUnit('Socket not writeable.');
      }
      else {
        this.client.write(bytes);
        this.emit('bytesWritten', this.client.bytesWritten);
      }
    }
    catch (err) {
      debugUnit(`Error writing to net: ${err.message}`);
    }
  }
  public readMockBytesAsString(hexStr: string) {
    let bytes = [];
    for (let i = 0; i < hexStr.length; i += 2) {
      console.log(hexStr.length);
      bytes.push(parseInt(hexStr.substring(i, i + 2), 16));
    }
    let buf = Buffer.from(bytes);
    this.processData(buf);
  }
  public keepAliveAsync() {
    let self = this;
    try {
      if (!this.isConnected) return;
      if (typeof this._keepAliveTimer !== 'undefined' || this._keepAliveTimer) clearTimeout(this._keepAliveTimer);
      this._keepAliveTimer = null;
      self.pingServerAsync().catch(err => {
        debugUnit(`Error pinging server: ${err.message}`)
      });
    } catch (error) {
      debugUnit("ERROR pinging server")
    }
    finally {
      this._keepAliveTimer = setTimeoutSync(() => {
        self.keepAliveAsync()
      }, this._keepAliveDuration || 30000);
    }
  }

  public processData(msg: Buffer) {
    // ensure we can hold this message
    if (this._buffer.length < msg.length + this._bufferIdx) {
      this._buffer = Buffer.alloc(msg.length + this._buffer.length, this._buffer);
    }
    // if this is the start of a new message (as opposed to the continuation of a previous one)
    // then store how long this message tells us it is
    if (this._bufferIdx === 0) {
      this._expectedMsgLen = msg.readInt32LE(4) + 8;
    }

    // if the expected message length is less than the message length, it means we have two messages
    // packed into the same data
    let toRead = Math.min(this._expectedMsgLen, msg.length);
    msg.copy(this._buffer, this._bufferIdx, 0, toRead);
    this._bufferIdx = this._bufferIdx + toRead;

    // once we've read the expected length, we have a full message to handle
    if (this._bufferIdx === this._expectedMsgLen) {
      let b = this._buffer.slice(0, this._expectedMsgLen);
      if (b.length > 4) {
        let message = new Inbound(this.controllerId, this.senderId);
        message.readFromBuffer(b);
        this.toLogEmit(message, 'in');
        this.onClientMessage(message);
      }
      this._bufferIdx = 0;
    }

    // finally check if there was more in the buffer than what we expected to receive.
    // if so, there's another message (or more) left to be read
    if (toRead < msg.length) {
      this.processData(msg.slice(toRead, msg.length));
    }
  }

  toLogEmit(message, direction) {
    if (this._isMock) return;
    let data = {
      systemName: this.systemName,
      action: message.action,
      controllerId: message.controllerId,
      clientId: this.clientId,
      senderId: this.senderId,
      serverAddress: this.serverAddress,
      serverPort: this.serverPort,
      payload: message.toBuffer().toJSON().data,
      protocol: 'screenlogic',
      dir: direction
    };
    this.emit('slLogMessage', data);
  }

  async closeAsync(): Promise<boolean> {
    let self = this;
    return new Promise(async (resolve, reject) => {
      try {

        if (typeof this._keepAliveTimer !== 'undefined' || this._keepAliveTimer) clearTimeout(this._keepAliveTimer);
        this._keepAliveTimer = null;
        if (typeof self.client === 'undefined' || self.client.destroyed) {
          resolve(true);
        }
        else {
          if (self.isConnected) {
            let removeClient = await self.removeClientAsync();
            debugUnit(`Removed client: ${removeClient}`);
          }
          self.client.setKeepAlive(false);
          self.client.destroy();
          self.isConnected = false;
          self.client.removeAllListeners();
          self.removeAllListeners();
          self.client = undefined;
          resolve(true);
          // () => {
          //   debugUnit(`Client socket closed`);
          //   resolve(true);
          //   self.client.
          // });
          // resolve(true);
        }
      } catch (error) {
        debugUnit(`caught error in closeAsync ${error.message}... returning anwyay`);
        resolve(true);
      }

    });
  }

  public async connectAsync(): Promise<boolean> {
    if (this._isMock) return Promise.resolve(true);
    var self = this;
    return new Promise(async (resolve, reject) => {
      try {

        let opts = {
          allowHalfOpen: false,
          keepAlive: true,
          keepAliveInitialDelay: 5
        };
        self.client = new net.Socket(opts);
        self.client.setKeepAlive(true, 10 * 1000);
        self.client.on('data', function (msg) {
          self.emit('bytesRead', self.client.bytesRead);
          self.processData(msg);
        })
          .once('close', function (had_error) {
            debugUnit(`closed.  any error? ${had_error}`);
            self.emit('close', had_error);
          })
          .once('end', function (e) {
            // often, during debugging, the socket will timeout
            debugUnit(`end event for unit: ${e.message}`);
            self.emit('end', e);
          })
          .once('error', async function (e) {
            // often, during debugging, the socket will timeout
            debugUnit(`error event for unit: ${typeof e !== 'undefined' ? e.message : 'unknown unit'}`);
            // self.emit('error', e);
            await self.reconnectAsync();
          })
          .once('timeout', async function (e) {
            // often, during debugging, the socket will timeout
            debugUnit(`timeout event for unit: ${e.message}`);
            self.emit('timeout', e);
            await self.reconnectAsync();
          })
          .once('clientError', async function (err, socket) {
            if (err.code === 'ECONNRESET' || !socket.writable) socket.end('HTTP/2 400 Bad Request\n');
            debugUnit('client error\n', err);
            await self.reconnectAsync();
          });

        debugUnit('connecting...');
        let connected = false;
        self.client.once('ready', () => {
          debugUnit('connected, sending init message...');
          self.write('CONNECTSERVERHOST\r\n\r\n');
          debugUnit('sending challenge message...');
          let _timeout = setTimeoutSync(() => {
            if (typeof reject === 'function') reject(new Error(`timeout`));
          }, screenlogic.netTimeout)
          self.once('challengeString', async function (challengeString) {
            debugUnit('   challenge string emit');
            try {
              await self.loginAsync(challengeString);
              resolve(true);
            } catch (error) {
              reject(error);
            }
            finally {
              clearTimeout(_timeout);
            }
          })
          let msg = screenlogic.controller.connection.sendChallengeMessage();
          this.toLogEmit(msg, 'out');
        })

        self.client.connect(self.serverPort, self.serverAddress, function () {
          connected = true;
        });
      } catch (error) {
        debugUnit(`Caught connectAsync error ${error.message}; rethrowing...`)
        throw error;
      }
    })
  }

  async loginAsync(challengeString: string) {
    let self = this;
    return new Promise(async (resolve, reject) => {
      debugUnit('sending login message...');
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for challenge string'));
      }, screenlogic.netTimeout);
      self.once('loggedIn', () => {
        clearTimeout(_timeout);
        debugUnit('received loggedIn event');
        self.isConnected = true;
        resolve(true);
        self.removeListener('loginFailed', function () { });
      }).once('loginFailed', function () {
        clearTimeout(_timeout);
        self.isConnected = false;
        debugUnit('loginFailed');
        reject(new Error('Login Failed'));
      })
      var password = new Encoder(self.password.toString()).getEncryptedPassword(challengeString);
      let msg = screenlogic.controller.connection.sendLoginMessage(password);
      this.toLogEmit(msg, 'out');
    })
  }
  public bytesRead() {
    return this.client.bytesRead;
  }
  public bytesWritten() {
    return this.client.bytesWritten;
  }
  public status() {
    if (typeof this.client === 'undefined') {
      return {
        destroyed: true,
        connecting: false,
        // pending: this.client.pending, // should be here but isn't?
        timeout: undefined,
        readyState: 'closed',
      }
    }
    return {
      destroyed: this.client.destroyed,
      connecting: this.client.connecting,
      // pending: this.client.pending, // should be here but isn't?
      timeout: this.client.timeout,
      readyState: this.client.readyState,
    }
  }
  async getVersionAsync(): Promise<string> {
    let self = this;
    return new Promise(async (resolve, reject) => {

      debugUnit('[%d] sending version query...', self.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for version'));
      }, screenlogic.netTimeout);
      self.once('version', (version) => {
        clearTimeout(_timeout);
        debugUnit('received version event');
        resolve(version);
      })
      let msg = screenlogic.controller.connection.sendVersionMessage();
      this.toLogEmit(msg, 'out');
    })
  }

  async addClientAsync(clientId?: number): Promise<boolean> {
    if (this._isMock) return Promise.resolve(true);
    let self = this;
    if (clientId) this.clientId = clientId;
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending add client command, clientId %d...', self.senderId, self.clientId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for add client response'));
      }, screenlogic.netTimeout);
      self.once('addClient', (clientAck) => {
        clearTimeout(_timeout);
        debugUnit('received addClient event');
        resolve(true);
      })
      let msg = self.controller.connection.sendAddClientMessage();
      this.toLogEmit(msg, 'out');
    });
  }

  async removeClientAsync(): Promise<boolean> {
    if (this._isMock) return Promise.resolve(true);
    let self = this;
    return new Promise(async (resolve, reject) => {
      try {

        debugUnit(`[${self.senderId}] sending remove client command, clientId ${self.clientId}...`,);
        let _timeout = setTimeoutSync(() => {
          reject(new Error('time out waiting for remove client response'));
        }, screenlogic.netTimeout);
        self.once('removeClient', (clientAck) => {
          clearTimeout(_timeout);
          debugUnit('received removeClient event');
          resolve(true);
        })
        let msg = screenlogic.controller.connection.sendRemoveClientMessage();
        this.toLogEmit(msg, 'out');
      } catch (error) {
        debugUnit(`caught remove client error ${error.message}, rethrowing...`);
        throw error;
      }
    });
  }

  async pingServerAsync(): Promise<boolean> {
    let self = this;
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] pinging server', self.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for ping server response'));
      }, screenlogic.netTimeout);
      self.once('pong', (pong) => {
        clearTimeout(_timeout);
        debugUnit('received pong event');
        resolve(true);
      })
      let msg = screenlogic.controller.connection.sendPingMessage();
      this.toLogEmit(msg, 'out');
    });
  }

  onClientMessage(msg: Inbound) {
    debugUnit(`received ${msg.action} message of length ${msg.length}`);
    switch (msg.action) {
      case 15:
        debugUnit("  it's a challenge response");
        let challengeString = ConnectionMessage.decodeChallengeResponse(msg);
        this.emit('challengeString', challengeString)
        break;
      case 28:
        debugUnit("  it's a login response");
        this.emit('loggedIn');
        break;
      case 13:
        debugUnit("  it's a login failure.");
        this.emit('loginFailed');
        break;
      case 12500:
      case 12527:
        debugUnit("  it's pool status");
        let equipmentState = EquipmentStateMessage.decodeEquipmentStateResponse(msg);
        this.emit('equipmentState', equipmentState);
        break;
      case 12521:
        debugUnit("  it's set circuit info");
        let circuit = CircuitMessage.decodeSetCircuit(msg);
        this.emit('circuit', circuit);
        break;
      case 8121:
        debugUnit("  it's version");
        let ver = ConnectionMessage.decodeVersionResponse(msg);
        this.emit('version', ver);
        break;
      case 12573:
        debugUnit("  it's salt cell config");
        this.emit('intellichlorConfig', ChlorMessage.decodeIntellichlorConfig(msg));
        break;
      case 12511:
        debugUnit("  it's a get circuit definitions answer");
        this.emit('circuitDefinitions', EquipmentConfigurationMessage.decodeCircuitDefinitions(msg));
        break;
      case 12559:
        debugUnit("  it's get circuit names answer");
        this.emit('nCircuitNames', EquipmentConfigurationMessage.decodeNCircuitNames(msg));
        break;
      case 12560:
      case 12562:
        debugUnit("  it's get circuit names answer");
        this.emit('circuitNames', EquipmentConfigurationMessage.decodeCircuitNames(msg));
        break;
      case 12533:
        debugUnit("  it's controller configuration");
        this.emit('equipmentConfig', EquipmentConfigurationMessage.decodeControllerConfig(msg));
        break;
      case 12505:
      case 12593:
        debugUnit("  it's chem data");
        this.emit('chemicalData', ChemMessage.decodeChemDataMessage(msg));
        break;
      case 8111:
        debugUnit("  it's system time");
        this.emit('getSystemTime', EquipmentStateMessage.decodeSystemTime(msg));
        break;
      case 12543:
        debugUnit("  it's schedule data");
        this.emit('getScheduleData', ScheduleMessage.decodeGetScheduleMessage(msg));
        break;
      case 12581:
        debugUnit("  it's a cancel delay ack");
        this.emit('cancelDelay', EquipmentStateMessage.decodeCancelDelay(msg));
        break;
      case 12523:
        debugUnit("  it's an add client ack");
        this.emit('addClient', ConnectionMessage.decodeAddClient(msg));
        break;
      case 12525:
        debugUnit("  it's a remove client ack");
        this.emit('removeClient', ConnectionMessage.decodeRemoveClient(msg));
        break;
      case 17:
        debugUnit("  it's a pong");
        this.emit('pong', ConnectionMessage.decodePingClient(msg));
        break;
      case 12567:
        debugUnit("  it's a get equipment configuration");
        this.emit('equipmentConfiguration', EquipmentConfigurationMessage.decodeGetEquipmentConfiguration(msg));
        break;
      case 12568:
        debugUnit("  it's a SET equipment configuration");
        this.emit('setEquipmentConfiguration', EquipmentConfigurationMessage.decodeSetEquipmentConfiguration(msg));
        break;
      case 12569:
        debugUnit("  it's a SET equipment configuration ack");
        this.emit('setEquipmentConfigurationAck', EquipmentConfigurationMessage.decodeSetEquipmentConfigurationAck(msg));
        break;
      case 12585:
        debugUnit("  it's pump status");
        this.emit('getPumpStatus', PumpMessage.decodePumpStatus(msg));
        break;
      case 9808:
        debugUnit("  it's a weather forecast ack");
        this.emit('weatherForecast', EquipmentConfigurationMessage.decodeWeatherMessage(msg));
        break;
      case 12531:
        debugUnit("  it's circuit toggle ack");
        this.emit('circuitStateChanged', CircuitMessage.decodeSetCircuitState(msg));
        break;
      case 12529:
        debugUnit("  it's a setpoint ack");
        this.emit('setPointChanged', HeaterMessage.decodeSetHeatSetPoint(msg));
        break;
      case 12591:
        debugUnit("  it's a cool setpoint ack");
        this.emit('coolSetPointChanged', HeaterMessage.decodeCoolSetHeatSetPoint(msg));
        break;
      case 12539:
        debugUnit("  it's a heater mode ack");
        this.emit('heatModeChanged', HeaterMessage.decodeSetHeatModePoint(msg));
        break;
      case 12557:
        debugUnit("  it's a light control ack");
        this.emit('sentLightCommand', CircuitMessage.decodeSetLight(msg));
        break;
      case 12504: // ~16-20s sequence intellibrite light theme
        debugUnit("  it's a light sequence delay packet");
        this.emit('intellibriteDelay', 1);
        break;
      case 12575:
        debugUnit("  it's a set salt cell isActive ack");
        this.emit('intellichlorIsActive', ChlorMessage.decodeSetEnableIntellichlorConfig(msg));
        break;
      case 12577:
        debugUnit("  it's a set salt cell config ack");
        this.emit('setIntellichlorConfig', ChlorMessage.decodeSetIntellichlorConfig(msg));
        break;
      case 12545:
        debugUnit("  it's a new schedule event ack");
        this.emit('addNewScheduleEvent', ScheduleMessage.decodeAddSchedule(msg));
        break;
      case 12547:
        debugUnit("  it's a delete schedule event ack");
        this.emit('deleteScheduleEventById', ScheduleMessage.decodeDeleteSchedule(msg));
        break;
      case 12549:
        debugUnit("  it's a set schedule event ack");
        this.emit('setScheduleEventById', ScheduleMessage.decodeSetSchedule(msg));
        break;
      case 12551:
        debugUnit("  it's a set circuit runtime ack");
        this.emit('setCircuitRuntimebyId', CircuitMessage.decodeSetCircuitRunTime(msg));
        break;
      case 12563:
        debugUnit("  it's a get custom names packet");
        this.emit('getCustomNames', EquipmentConfigurationMessage.decodeCustomNames(msg));
        break;
      case 12565:
        debugUnit("  it's a set custom names packet");
        this.emit('setCustomName', EquipmentConfigurationMessage.decodeSetCustomNameAck(msg));
        break;
      case 12587:
        debugUnit("  it's a set pump flow ack");
        this.emit('setPumpSpeed', PumpMessage.decodeSetPumpSpeed(msg));
        break;

      // ------------  ASYNC MESSAGES --------------- //

      case 8113:
        debugUnit("  it's a set system time ack");
        this.emit('setSystemTime', EquipmentStateMessage.decodeSetSystemTime(msg));
        break;
      case 12535:
        debugUnit("  it's a history data query ack");
        this.emit('getHistoryDataPending');
        break;
      case 12502:
        debugUnit("  it's a history data payload");
        this.emit('getHistoryData', EquipmentConfigurationMessage.decodeGetHistory(msg));
        break;
      case 12597:
        debugUnit("  it's a chem history data query ack");
        this.emit('getChemHistoryDataPending');
        break;
      case 12506:
        debugUnit("  it's a chem history data payload");
        this.emit('getChemHistoryData', ChemMessage.decodecChemHistoryMessage(msg));
        break;


      case 9806:
        debugUnit("  it's a 'weather forecast changed' notification");
        this.emit('weatherForecastChanged');
        break;
      case 12501:
        debugUnit("  it's a schedule changed notification");
        this.emit('scheduleChanged');
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
        EquipmentStateMessage.decodeGeneric(msg);
        debugUnit("  it's an unknown type: %d", msg.action);
        break;
    }
  }
}
export let screenlogic = new UnitConnection();
export class Equipment {
  async setSystemTimeAsync(date: Date, shouldAdjustForDST: boolean): Promise<SLSystemTimeData> {
    return new Promise(async (resolve, reject) => {
      if (!(date instanceof Date)) {
        debugUnit('setSystemTime() must receive valid Date object for the date argument');
        reject(new Error(`Date is not of type date`));
        // this.emit('setSystemTime', null);
        return;
      }

      if (typeof shouldAdjustForDST !== 'boolean') {
        debugUnit('setSystemTime() must receive a boolean for the shouldAdjustForDST argument');
        reject(new Error(`setSystemTime() must receive a boolean for the shouldAdjustForDST argument`));
        // this.emit('setSystemTime', null);
        return;
      }
      debugUnit('[%d] sending set system time command...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for set system time response'));
      }, screenlogic.netTimeout);
      screenlogic.once('setSystemTime', (data) => {
        clearTimeout(_timeout);
        debugUnit('received setSystemTime event');
        resolve(data);
      })
      let msg = screenlogic.controller.equipment.sendSetSystemTimeMessage(date, shouldAdjustForDST);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async getWeatherForecastAsync(): Promise<SLWeatherForecastData> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] requesting weather forecast', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for weather forecast response'));
      }, screenlogic.netTimeout);
      screenlogic.once('weatherForecast', (equipment) => {
        clearTimeout(_timeout);
        debugUnit('received weatherForecast event');
        resolve(equipment);
      })
      let msg = screenlogic.controller.equipment.sendGetWeatherMessage();
      screenlogic.toLogEmit(msg, 'out');
    });
  }

  async getHistoryDataAsync(fromTime?: Date, toTime?: Date): Promise<SLHistoryData> {
    return new Promise(async (resolve, reject) => {
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for get history response'));
      }, screenlogic.netTimeout);
      screenlogic.once('getHistoryData', (data) => {
        clearTimeout(_timeout);
        debugUnit('received getHistoryData event');
        resolve(data);
      })
      let now: Date = new Date();
      let yesterday: Date = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      debugUnit('[%d] requesting history data from `%s` to `%s`', screenlogic.senderId, fromTime || yesterday, toTime || now);
      let msg = screenlogic.controller.equipment.sendGetHistoryMessage(fromTime || yesterday, toTime || now);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async getAllCircuitNamesAsync(): Promise<any> {
    let size = await this.getNCircuitNamesAsync();
    let circNames = await this.getCircuitNamesAsync(size);
    return circNames;
  }
  async getNCircuitNamesAsync(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending get n circuit names query...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for get n circuit names response'));
      }, screenlogic.netTimeout);
      screenlogic.once('nCircuitNames', (data) => {
        clearTimeout(_timeout);
        debugUnit('received n circuit names event');
        resolve(data);
      })
      let msg = screenlogic.controller.equipment.sendGetNumCircuitNamesMessage();
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async getCircuitNamesAsync(size: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending get circuit names query...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for get circuit names response'));
      }, screenlogic.netTimeout * 3);
      screenlogic.once('circuitNames', (data) => {
        clearTimeout(_timeout);
        debugUnit('received n circuit names event');
        resolve(data);
      })
      let msg = screenlogic.controller.equipment.sendGetCircuitNamesMessage(0, 101);
      screenlogic.toLogEmit(msg, 'out');

      /* 
      // This method works and is how SL does it; but it is also possible to get all the names in one pass, so why not?
      let idx = 0;
      let cnt = 25;
      let names = [];
      let adj = size - names.length < 25 ? size - names.length : cnt;
      screenlogic.on('circuitNames', (data) => {
        debugUnit('receivedcircuit names event');
        data.forEach(el => { el.id = el.id + idx;})
        names = [...names, ...data];
        idx > names.length ? names.length - 1 : idx += 25;
        adj = size - names.length < 25 ? size - names.length : cnt;
        let msg = screenlogic.controller.equipment.sendGetCircuitNamesMessage(idx, adj);
        screenlogic.toLogEmit(msg, 'out');
        
        if (names.length >= size){
          clearTimeout(_timeout);
          screenlogic.removeListener('circuitNames', ()=>{});
          resolve(names);
        }
      })
      let msg = screenlogic.controller.equipment.sendGetCircuitNamesMessage(idx, adj);
      screenlogic.toLogEmit(msg, 'out'); 
      */
    });
  }
  async getCircuitDefinitionsAsync(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending get circuit definitions query...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for get circuit definitions response'));
      }, screenlogic.netTimeout);
      screenlogic.once('circuitDefinitions', (data) => {
        clearTimeout(_timeout);
        debugUnit('received circuit definitions event');
        resolve(data);
      })
      let msg = screenlogic.controller.equipment.sendGetCircuitDefinitionsMessage();
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async getEquipmentConfigurationAsync(): Promise<SLEquipmentConfigurationData> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending equipment configuration query...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for equipment configuration response'));
      }, screenlogic.netTimeout);
      screenlogic.once('equipmentConfiguration', (data: SLEquipmentConfigurationData) => {
        clearTimeout(_timeout);
        debugUnit('received equipmentConfiguration event');
        resolve(data);
      })
      let msg = screenlogic.controller.equipment.sendGetEquipmentConfigurationMessage();
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async setEquipmentConfigurationAsync(data: any): Promise<boolean> {
    function updateBit(number, bitPosition, bitValue) {
      const bitValueNormalized = bitValue ? 1 : 0;
      const clearMask = ~(1 << bitPosition);
      return (number & clearMask) | (bitValueNormalized << bitPosition);
    }
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending set equipment configuration query...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for set equipment configuration response'));
      }, screenlogic.netTimeout);
      screenlogic.once('setEquipmentConfiguration', (data: SLEquipmentConfigurationData) => {
        clearTimeout(_timeout);
        debugUnit('received setEquipmentConfiguration event');
        resolve(false);
      })
      // theory here is that we may not know all of the exact bytes yet in the equipment config. 
      // Eventually we should be able to recreate it, but for now we should check to make sure
      // we don't screw anything up.  We can do that by comparing the existing array to the
      // constructed array and look for differences that shouldn't be there.
      let equipConfig: SLEquipmentConfigurationData = await screenlogic.equipment.getEquipmentConfigurationAsync();

      let resData: rawData & { alarm: number } = {
        ...JSON.parse(JSON.stringify(equipConfig.rawData)),
        alarm: data.alarm
      }

      // High Speed
      if (typeof data.highSpeedCircuits !== 'undefined') {
        let max = 0;
        if (EquipmentConfigurationMessage.isEasyTouch(UnitConnection.controllerType)) {
          // easytouch = 4; it = 8
          max = 4;
        }
        else if (EquipmentConfigurationMessage.isDualBody(UnitConnection.controllerType)) {
          max = 8;
        }
        for (let i = 0; i < max; i++) {
          if (typeof data.highSpeedCircuits[i] !== 'undefined') {
            resData.highSpeedCircuitData = data.highSpeedCircuits[i];
          }
        }
      }

      // PUMPS
      if (typeof data.pumps !== 'undefined') {
        for (let i = 0; i < data.pumps.length; i++) {
          let pump = data.pumps[i];
          if (pump.id === 0) continue;
          let pumpIndex = pump.id || i + 1;
          let pumpIndexByte = 45 * pumpIndex;
          resData.pumpData[pumpIndexByte] = pump.type;
          if (pump.type === 128 || pump.type === 169 || pump.type === 169 || pump.type === 255) {
            for (let pc = 0; pc < pump.circuits.length; pc++) {
              let circuit = pump.circuits[pc];
              if (typeof pump.circuit === 'undefined' || pump.circuit === 0) {
                resData.pumpData[pumpIndexByte + (pc * 2 + 2)] = 0;
                resData.pumpData[pumpIndexByte + (pc * 2 + 3)] = 0;
                resData.pumpData[pumpIndexByte + (pc * 2 + 20)] = 0;
              }
              else {
                resData.pumpData[pumpIndexByte + (pc * 2 + 2)] = circuit.circuit || 0;
                resData.pumpData[pumpIndexByte + (pc * 2 + 3)] = Math.floor(circuit.speed / 256) || 0;
                resData.pumpData[pumpIndexByte + (pc * 2 + 20)] = circuit.speed % 256 || 0;
              }
            }
            resData.pumpData[pumpIndexByte + 20] = Math.floor(pump.primingSpeed / 256) || 0;
            resData.pumpData[pumpIndexByte + 29] = pump.primingSpeed % 256 || 0;
            resData.pumpData[pumpIndexByte + 1] = pump.primingTime || 0;
          }
          else if (pump.type < 64) {
            for (let pc = 0; pc < 8; pc++) {
              let circuit = pump.circuits[pc];
              if (typeof pump.circuit === 'undefined' || pump.circuit === 0) {
                resData.pumpData[pumpIndexByte + (pc * 2 + 2)] = 0;
                resData.pumpData[pumpIndexByte + (pc * 2 + 3)] = 0;
              }
              else {
                resData.pumpData[pumpIndexByte + (pc * 2 + 2)] = circuit.circuit || 0;
                resData.pumpData[pumpIndexByte + (pc * 2 + 3)] = circuit.flow || 0;
              }
            }
            resData.pumpData[pumpIndexByte] = pump.backgroundCircuit || 6;
            resData.pumpData[pumpIndexByte + 1] = pump.filterSize / 1000 || 15000;
            resData.pumpData[pumpIndexByte + 2] = pump.turnovers || 2;
            resData.pumpData[pumpIndexByte + 20] = pump.manualFilterGPM || 30;
            resData.pumpData[pumpIndexByte + 21] = pump.primingSpeed || 55;
            resData.pumpData[pumpIndexByte + 22] = (pump.primingTime | pump.maxSystemTime << 4) || 0;
            resData.pumpData[pumpIndexByte + 23] = pump.maxPressureIncrease || 0;
            resData.pumpData[pumpIndexByte + 24] = pump.backwashFlow || 60;
            resData.pumpData[pumpIndexByte + 25] = pump.backwashTime || 5;
            resData.pumpData[pumpIndexByte + 26] = pump.rinseTime || 1;
            resData.pumpData[pumpIndexByte + 27] = pump.vacuumFlow || 50;
            resData.pumpData[pumpIndexByte + 29] = pump.vacuumTime || 10;

          }
          else if (pump.type === 64) {
            let ubyte = 0;
            for (let pc = 0; pc < 8; pc++) {
              let circuit = pump.circuits[pc];
              if (typeof pump.circuit === 'undefined' || pump.circuit === 0) {
                resData.pumpData[pumpIndexByte + (pc * 2 + 2)] = 0;
                resData.pumpData[pumpIndexByte + (pc * 2 + 3)] = 0;
                resData.pumpData[pumpIndexByte + (pc * 2 + 20)] = 0;
              }
              else {
                resData.pumpData[pumpIndexByte + (pc * 2 + 2)] = circuit.circuit || 0;
                if (circuit.units) {
                  // gpm
                  resData.pumpData[pumpIndexByte + (pc * 2 + 3)] = circuit.flow || 0;
                  ubyte |= (1 << (i - 1));
                }
                else {
                  resData.pumpData[pumpIndexByte + (pc * 2 + 3)] = Math.floor(circuit.speed / 256) || 0;
                  resData.pumpData[pumpIndexByte + (pc * 2 + 20)] = circuit.speed % 256 || 0;
                }

              }
            }
            resData.pumpData[pumpIndexByte + 3] = ubyte || 0;
          }
        }
      }

      // HEATERS
      if (typeof data.heaters !== 'undefined') {
        let thermaFloPresent = false;
        let thermaFloCoolPresent = false;
        let body1SolarPresent = false;
        let solarHeatPumpPresent = false;
        let body2SolarPresent = false; // dual body?
        for (let i = 0; i < data.heaters.length; i++) {
          let heater = data.heaters[i];
          if (heater.type === 3) {
            thermaFloPresent = true;
            thermaFloCoolPresent = heater.thermaFloCoolPresent;
          }
          else if (heater.type === 2) {
            body1SolarPresent = true;
          }
          else if (heater.type === 3) {
            solarHeatPumpPresent = true;
          }
        }
        if (body2SolarPresent) resData.heaterConfigData[0] = resData.heaterConfigData[0] |= (1 << 4);
        if (body1SolarPresent) resData.heaterConfigData[0] = resData.heaterConfigData[0] |= (1 << 1);
        if (thermaFloCoolPresent) resData.heaterConfigData[1] = resData.heaterConfigData[1] |= (1 << 1);
        if (thermaFloPresent) resData.heaterConfigData[2] = resData.heaterConfigData[2] |= (1 << 5);
        if (solarHeatPumpPresent) resData.heaterConfigData[2] = resData.heaterConfigData[2] |= (1 << 4);
        // manual heat is in misc section
      }

      // DELAYS
      if (typeof data.misc !== 'undefined') {
        if (typeof data.misc.poolPumpOnDuringHeaterCooldown !== 'undefined') resData.delayData[0] = updateBit(resData.delayData[0], 0, data.misc.poolPumpOnDuringHeaterCooldown ? 1 : 0);
        if (typeof data.misc.spaPumpOnDuringHeaterCooldown !== 'undefined') resData.delayData[0] = updateBit(resData.delayData[0], 1, data.misc.spaPumpOnDuringHeaterCooldown ? 1 : 0);
        if (typeof data.misc.pumpDelay !== 'undefined') resData.delayData[0] = updateBit(resData.delayData[0], 7, data.misc.pumpDelay ? 1 : 0);
      }
      // INTELLICHEM

      if (typeof data.chem !== 'undefined') {
        let active = typeof data.chem.isActive !== 'undefined' ? (data.chem.isActive ? 1 : 0) : resData.miscData[3] & 0x01;
        resData.miscData[3] = updateBit(resData.miscData[3], 0, active);
      }
      // MISC
      if (typeof data.misc !== 'undefined') {
        if (typeof data.misc.units !== 'undefined') resData.heaterConfigData[2] = updateBit(resData.heaterConfigData[2], 0, data.misc.units ? 1 : 0);
        if (typeof data.misc.manualHeat !== 'undefined') resData.miscData[4] = data.misc.manualHeat ? 1 : 0;
      }

      // VALVES
      if (typeof data.valves !== 'undefined') {
        // ignore for now
      }
      // REMOTES
      if (typeof data.remotes !== 'undefined') {
        // ignore for now
      }
      // LIGHTS
      if (typeof data.lightGroup !== 'undefined') {
        // ignore for now
      }
      // MACRO
      if (typeof data.circuitGroup !== 'undefined') {
        // ignore for now
      }
      // SPA COMMAND
      if (typeof data.spaCommand !== 'undefined') {

      }
      let ready = false;
      if (ready) {
        let msg = screenlogic.controller.equipment.sendSetEquipmentConfigurationMessageAsync(resData);
        screenlogic.toLogEmit(msg, 'out');
      }
      else {
        function dec2bin(dec) {
          return (dec >>> 0).toString(2).padStart(8, '0');
        }
        for (const [key, value] of Object.entries(resData)) {
          debugUnit(key);
          for (let i = 0; i < resData[key].length; i++) {
            if (resData[key][i] !== equipConfig.rawData[key][i]) {
              debugUnit(`Difference at ${key}[${i}].  prev: ${resData[key][i]} (${dec2bin(resData[key][i])})-> new: ${equipConfig.rawData[key][i]} (${dec2bin(equipConfig.rawData[key][i])})`)
            }
          }
        }
      }
    });
  }
  async cancelDelayAsync(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending cancel delay command...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting to cancel delays'));
      }, screenlogic.netTimeout);
      screenlogic.once('cancelDelay', (delay) => {
        clearTimeout(_timeout);
        debugUnit('received cancelDelay event');
        resolve(true);
      })
      let msg = screenlogic.controller.equipment.sendCancelDelayMessage();
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async getSystemTimeAsync(): Promise<SLSystemTimeData> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending get system time query...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for chemical config'));
      }, screenlogic.netTimeout);
      screenlogic.once('getSystemTime', (systemTime) => {
        clearTimeout(_timeout);
        debugUnit('received getSystemTime event');
        resolve(systemTime);
      })
      let msg = screenlogic.controller.equipment.sendGetSystemTimeMessage();
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async getControllerConfigAsync(): Promise<SLControllerConfigData> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending controller config query...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for controller config'));
      }, screenlogic.netTimeout);
      screenlogic.once('equipmentConfig', (controller) => {
        clearTimeout(_timeout);
        debugUnit('received equipmentConfig event');
        resolve(controller);
      })
      let msg = screenlogic.controller.equipment.sendGetControllerConfigMessage();
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async getEquipmentStateAsync(): Promise<SLEquipmentStateData> {
    return new Promise(async (resolve, reject) => {

      debugUnit('[%d] sending pool status query...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for pool status'));
      }, screenlogic.netTimeout);
      screenlogic.once('equipmentState', (equipmentState: SLEquipmentStateData) => {
        clearTimeout(_timeout);
        debugUnit('received equipmentState event');
        resolve(equipmentState);
      })
      let msg = screenlogic.controller.equipment.sendGetEquipmentStateMessage();
      screenlogic.toLogEmit(msg, 'out');
    })
  }
  async getCustomNamesAsync(): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending get custom names: %d...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for custom names'));
      }, screenlogic.netTimeout);
      screenlogic.once('getCustomNames', (customNames) => {
        clearTimeout(_timeout);
        debugUnit('received getCustomNames event');
        resolve(customNames);
      })
      let msg = screenlogic.controller.equipment.sendGetCustomNamesMessage();
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async setCustomNameAsync(idx: number, name: string): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending set custom names: %d...', screenlogic.senderId);
      if (name.length > 11) reject(`Name (${name}) must be less than 12 characters`);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for set custom name'));
      }, screenlogic.netTimeout);
      screenlogic.once('setCustomName', (customNames) => {
        clearTimeout(_timeout);
        debugUnit('received setCustomName event');
        resolve(customNames);
      })
      let msg = screenlogic.controller.equipment.sendSetCustomNameMessage(idx, name);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
}

export class Circuit extends UnitConnection {
  async sendLightCommandAsync(command: LightCommands): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending light command: controllerId: %d, command: %d...', screenlogic.senderId, this.controllerId, command);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for light command response'));
      }, screenlogic.netTimeout);
      screenlogic.once('sentLightCommand', (data) => {
        clearTimeout(_timeout);
        debugUnit('received sentLightCommand event');
        resolve(data);
      })
      let msg = screenlogic.controller.circuits.sendIntellibriteMessage(command);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async setCircuitRuntimebyIdAsync(circuitId, runTime): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending set circuit runtime command for circuitId: %d, runTime: %d...', screenlogic.senderId, circuitId, runTime);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for set circuit run time response'));
      }, screenlogic.netTimeout);
      screenlogic.once('setCircuitRuntimebyId', (data) => {
        clearTimeout(_timeout);
        debugUnit('received setCircuitRuntimebyId event');
        resolve(data);
      })
      let msg = screenlogic.controller.circuits.sendSetCircuitRuntimeMessage(circuitId, runTime);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async setCircuitAsync(circuitId: number, nameIndex: number, circuitFunction: number, circuitInterface: number, freeze: boolean, colorPos: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      debugUnit(`[${screenlogic.senderId}] sending set circuit command: controllerId: ${this.controllerId}, circuitId: ${circuitId}, nameIndex: ${nameIndex} circuitFunc: ${circuitFunction} circInterface: ${circuitInterface} freeze: ${freeze ? 'true' : 'false'} colorPos: ${colorPos}...`);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for set circuit state response'));
      }, screenlogic.netTimeout);
      screenlogic.once('circuit', (data) => {
        clearTimeout(_timeout);
        debugUnit('received circuit event');
        resolve(data);
      })
      let msg = screenlogic.controller.circuits.sendSetCircuitMessage(circuitId, nameIndex, circuitFunction, circuitInterface, freeze, colorPos);
      screenlogic.toLogEmit(msg, 'out');
    })
  }
  async setCircuitStateAsync(circuitId: number, circuitState: boolean): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending set circuit state command: controllerId: %d, circuitId: %d, circuitState: %d...', screenlogic.senderId, this.controllerId, circuitId, circuitState);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for set circuit state response'));
      }, screenlogic.netTimeout);
      screenlogic.once('circuitStateChanged', (data) => {
        clearTimeout(_timeout);
        debugUnit('received circuitStateChanged event');
        resolve(data);
      })
      let msg = screenlogic.controller.circuits.sendSetCircuitStateMessage(circuitId, circuitState);
      screenlogic.toLogEmit(msg, 'out');
    })
  }
}
export class Body extends UnitConnection {
  async setSetPointAsync(bodyIndex: BodyIndex, temperature): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending set setpoint command: controllerId: %d, bodyIndex: %d, temperature: %d...', screenlogic.senderId, this.controllerId, bodyIndex, temperature);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for body setpoint response'));
      }, screenlogic.netTimeout);
      screenlogic.once('setPointChanged', (data) => {
        clearTimeout(_timeout);
        debugUnit('received setPointChanged event');
        resolve(data);
      })
      let msg = screenlogic.controller.bodies.sendSetPointMessage(bodyIndex, temperature);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async setCoolSetPointAsync(bodyIndex: BodyIndex, temperature): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending set cool setpoint command: controllerId: %d, bodyIndex: %d, temperature: %d...', screenlogic.senderId, this.controllerId, bodyIndex, temperature);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for body coolSetpoint response'));
      }, screenlogic.netTimeout);
      screenlogic.once('coolSetPointChanged', (data) => {
        clearTimeout(_timeout);
        debugUnit('received coolSetPointChanged event');
        resolve(data);
      })
      let msg = screenlogic.controller.bodies.sendCoolSetPointMessage(bodyIndex, temperature);
      screenlogic.toLogEmit(msg, 'out');
    });
  }

  async setHeatModeAsync(bodyIndex: BodyIndex, heatMode: HeatModes): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending set heatmode command: controllerId: %d, bodyIndex: %d, heatMode: %d...', screenlogic.senderId, this.controllerId, bodyIndex, heatMode);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for body heat mode response'));
      }, screenlogic.netTimeout);
      screenlogic.once('heatModeChanged', (data) => {
        clearTimeout(_timeout);
        debugUnit('received heatModeChanged event');
        resolve(data);
      })
      let msg = screenlogic.controller.bodies.sendHeatModeMessage(bodyIndex, heatMode);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
}
export class Pump extends UnitConnection {
  async setPumpSpeedAsync(pumpId: number, circuitId: number, speed: number, isRPMs?: boolean): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      debugUnit(`[%d] sending set pump flow command for pumpId: ${pumpId}.  CircuitId: ${circuitId}, setPoint: ${speed}, isRPMs: ${isRPMs}}`);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for set pump speed response'));
        screenlogic.removeListener('setPumpSpeed', () => { });
      }, screenlogic.netTimeout);
      screenlogic.once('setPumpSpeed', (data) => {
        clearTimeout(_timeout);
        debugUnit('received setPumpSpeed event');
        resolve(data);
      })
      let msg = screenlogic.controller.pumps.sendSetPumpSpeed(pumpId, circuitId, speed, isRPMs);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async getPumpStatusAsync(pumpId): Promise<SLPumpStatusData> {
    return new Promise(async (resolve, reject) => {
      try {

        debugUnit('[%d] sending get pump status command for pumpId: %d...', screenlogic.senderId, pumpId);
        let _timeout = setTimeoutSync(() => {
          reject(new Error('time out waiting for pump status response'));
          screenlogic.removeListener('getPumpStatus', () => { });
        }, screenlogic.netTimeout);
        screenlogic.once('getPumpStatus', (data) => {
          clearTimeout(_timeout);
          debugUnit('received getPumpStatus event');
          resolve(data);
        })
        let msg = screenlogic.controller.pumps.sendGetPumpStatusMessage(pumpId);
        screenlogic.toLogEmit(msg, 'out');
      }
      catch (err) {
        debugUnit(`Error getting pump status: ${err.message}`);
        reject(err);
      }
    });
  }
}

export class Schedule extends UnitConnection {
  async setScheduleEventByIdAsync(scheduleId: number, circuitId: number, startTime: number, stopTime: number, dayMask: number, flags: number, heatCmd: number, heatSetPoint: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending set schedule event command for scheduleId: %d, circuitId: %d, startTime: %d, stopTime: %d, dayMask: %d, flags: %d, heatCmd: %d, heatSetPoint: %d...', screenlogic.senderId, scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for set schedule response'));
      }, screenlogic.netTimeout);
      screenlogic.once('setScheduleEventById', (data) => {
        clearTimeout(_timeout);
        debugUnit('received setScheduleEventById event');
        resolve(data);
      })
      let msg = screenlogic.controller.schedules.sendSetScheduleEventMessage(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async addNewScheduleEventAsync(scheduleType: SchedTypes): Promise<number> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending add new schedule event command for scheduleType: %d...', screenlogic.senderId, scheduleType);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for add new schedule response'));
      }, screenlogic.netTimeout);
      screenlogic.once('addNewScheduleEvent', (data) => {
        clearTimeout(_timeout);
        debugUnit('received addNewScheduleEvent event');
        resolve(data);
      })
      let msg = screenlogic.controller.schedules.sendAddScheduleEventMessage(scheduleType);
      screenlogic.toLogEmit(msg, 'out');
    });
  }

  async deleteScheduleEventByIdAsync(scheduleId: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending delete schedule event command for scheduleId: %d...', screenlogic.senderId, scheduleId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for delete schedule response'));
      }, screenlogic.netTimeout);
      screenlogic.once('deleteScheduleEventById', (data) => {
        clearTimeout(_timeout);
        debugUnit('received deleteScheduleEventById event');
        resolve(data);
      })
      let msg = screenlogic.controller.schedules.sendDeleteScheduleEventMessage(scheduleId);
      screenlogic.toLogEmit(msg, 'out');
    });
  }

  async getScheduleDataAsync(scheduleType: SchedTypes): Promise<SLScheduleData[]> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending get schedule data query for scheduleType: %d...', screenlogic.senderId, scheduleType);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for schedule data'));
      }, screenlogic.netTimeout);
      screenlogic.once('getScheduleData', (schedule) => {
        clearTimeout(_timeout);
        debugUnit('received getScheduleData event');
        resolve(schedule);
      })
      let msg = screenlogic.controller.schedules.sendGetSchedulesMessage(scheduleType);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
}

export class Chem extends UnitConnection {
  async getChemHistoryDataAsync(fromTime?: Date, toTime?: Date): Promise<SLChemHistory> {
    return new Promise(async (resolve, reject) => {
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for get chem history response'));
      }, screenlogic.netTimeout);
      screenlogic.once('getChemHistoryData', (data) => {
        clearTimeout(_timeout);
        debugUnit('received getChemHistoryData event');
        resolve(data);
      })
      let now: Date = new Date();
      let yesterday: Date = new Date();
      debugUnit('[%d] requesting chem history data from `%s` to `%s`', screenlogic.senderId, fromTime || yesterday, toTime || now);
      yesterday.setHours(now.getHours() - 24);
      let msg = screenlogic.controller.chem.sendGetChemHistoryMessage(fromTime || yesterday, toTime || now);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async getChemicalDataAsync(): Promise<SLChemData> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending chemical data query...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for chemical config'));
      }, screenlogic.netTimeout);
      screenlogic.once('chemicalData', (chemical) => {
        clearTimeout(_timeout);
        debugUnit('received chemicalData event');
        resolve(chemical);
      })
      let msg = screenlogic.controller.chem.sendGetChemStatusMessage();
      screenlogic.toLogEmit(msg, 'out');
    });
  }
}
export class Chlor extends UnitConnection {
  async setIntellichlorOutputAsync(poolOutput: number, spaOutput: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      debugUnit('[%d] sending set intellichlor output command: controllerId: %d, poolOutput: %d, spaOutput: %d...', screenlogic.senderId, this.controllerId, poolOutput, spaOutput);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for set intellichlor response'));
      }, screenlogic.netTimeout);
      screenlogic.once('setIntellichlorConfig', (equipment) => {
        clearTimeout(_timeout);
        debugUnit('received setIntellichlorConfig event');
        resolve(equipment);
      })
      let msg = screenlogic.controller.chlor.sendSetChlorOutputMessage(poolOutput, spaOutput);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async getIntellichlorConfigAsync(): Promise<SLIntellichlorData> {
    return new Promise(async (resolve, reject) => {

      debugUnit('[%d] sending salt cell config query...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for intellichlor config'));
      }, screenlogic.netTimeout);
      screenlogic.once('intellichlorConfig', (intellichlor) => {
        clearTimeout(_timeout);
        debugUnit('received intellichlorConfig event');
        resolve(intellichlor);
      })
      let msg = screenlogic.controller.chlor.sendGetSaltCellConfigMessage();
      screenlogic.toLogEmit(msg, 'out');
    });
  }
  async setIntellichlorIsActiveAsync(isActive: boolean): Promise<boolean> {
    return new Promise(async (resolve, reject) => {

      debugUnit('[%d] sending salt cell enable query...', screenlogic.senderId);
      let _timeout = setTimeoutSync(() => {
        reject(new Error('time out waiting for intellichlor enable'));
      }, screenlogic.netTimeout);
      screenlogic.once('intellichlorIsActive', (intellichlor) => {
        clearTimeout(_timeout);
        debugUnit('received intellichlorIsActive event');
        resolve(intellichlor);
      })
      let msg = screenlogic.controller.chlor.sendSetSaltCellEnableMessage(isActive);
      screenlogic.toLogEmit(msg, 'out');
    });
  }
}
/* debug print full buffer contents:
for (const value of buf.values()) {
  //console.log(value.toString(16));
}
*/

export enum LightCommands {
  LIGHT_CMD_LIGHTS_OFF = 0,
  LIGHT_CMD_LIGHTS_ON = 1,
  LIGHT_CMD_COLOR_SET = 2,
  LIGHT_CMD_COLOR_SYNC = 3,
  LIGHT_CMD_COLOR_SWIM = 4,
  LIGHT_CMD_COLOR_MODE_PARTY = 5,
  LIGHT_CMD_COLOR_MODE_ROMANCE = 6,
  LIGHT_CMD_COLOR_MODE_CARIBBEAN = 7,
  LIGHT_CMD_COLOR_MODE_AMERICAN = 8,
  LIGHT_CMD_COLOR_MODE_SUNSET = 9,
  LIGHT_CMD_COLOR_MODE_ROYAL = 10,
  LIGHT_CMD_COLOR_SET_SAVE = 11,
  LIGHT_CMD_COLOR_SET_RECALL = 12,
  LIGHT_CMD_COLOR_BLUE = 13,
  LIGHT_CMD_COLOR_GREEN = 14,
  LIGHT_CMD_COLOR_RED = 15,
  LIGHT_CMD_COLOR_WHITE = 16,
  LIGHT_CMD_COLOR_PURPLE = 17
}

export enum HeatModes {
  HEAT_MODE_OFF = 0,
  HEAT_MODE_SOLAR = 1,
  HEAT_MODE_SOLARPREFERRED = 2,
  HEAT_MODE_HEATPUMP = 3,
  HEAT_MODE_HEATER = 3,
  HEAT_MODE_DONTCHANGE = 4
}

export enum PumpTypes {
  PUMP_TYPE_INTELLIFLOVF = 5,
  PUMP_TYPE_INTELLIFLOVS = 3,
  PUMP_TYPE_INTELLIFLOVSF = 4
};

export enum BodyIndex {
  POOL = 0,
  SPA = 1
}

export interface Controller {
  circuits: CircuitCommands;
  connection: ConnectionCommands;
  equipment: EquipmentCommands;
  chlor: ChlorCommands;
  chem: ChemCommands;
  schedules: ScheduleCommands;
  pumps: PumpCommands;
  bodies: BodyCommands;
}
export enum SchedTypes {
  RECURRING = 0,
  RUNONCE = 1
}

export interface LocalUnit {
  address: string,
  type: number,
  port: number,
  gatewayType: number,
  gatewaySubtype: number,
  gatewayName:string,
}