'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedTypes = exports.BodyIndex = exports.PumpTypes = exports.HeatModes = exports.LightCommands = exports.Chlor = exports.Chem = exports.Schedule = exports.Pump = exports.Body = exports.Circuit = exports.Equipment = exports.screenlogic = exports.UnitConnection = exports.RemoteLogin = exports.FindUnits = void 0;
require("source-map-support/register");
var dgram = require('dgram');
const net = require("net");
const events_1 = require("events");
const SLGateway = require("./messages/SLGatewayDataMessage");
const OutgoingMessages_1 = require("./messages/OutgoingMessages");
const ConnectionMessage_1 = require("./messages/state/ConnectionMessage");
// import { Inbound } from './messages/SLMessage';
const EquipmentConfig_1 = require("./messages/state/EquipmentConfig");
const ChlorMessage_1 = require("./messages/state/ChlorMessage");
const ChemMessage_1 = require("./messages/state/ChemMessage");
const ScheduleMessage_1 = require("./messages/state/ScheduleMessage");
const PumpMessage_1 = require("./messages/state/PumpMessage");
const CircuitMessage_1 = require("./messages/state/CircuitMessage");
const HeaterMessage_1 = require("./messages/state/HeaterMessage");
const SLMessage_1 = require("./messages/SLMessage");
const EquipmentState_1 = require("./messages/state/EquipmentState");
const Encoder = require('./utils/PasswordEncoder').HLEncoder;
var debugFind = require('debug')('sl:find');
var debugRemote = require('debug')('sl:remote');
var debugUnit = require('debug')('sl:unit');
const timers_1 = require("timers");
class FindUnits extends events_1.EventEmitter {
    constructor() {
        super();
        this.message = Buffer.alloc(8);
        this.message[0] = 1;
        this.finder = dgram.createSocket('udp4');
        var _this = this;
        this.finder.on('listening', function () {
            _this.finder.setBroadcast(true);
            _this.finder.setMulticastTTL(128);
            if (!_this.bound) {
                _this.bound = true;
                _this.sendServerBroadcast();
            }
        }).on('message', function (msg, remote) {
            _this.foundServer(msg, remote);
        }).on('close', function () {
            debugFind('closed');
            _this.emit('close');
        }).on('error', function (e) {
            debugFind('error: %O', e);
            _this.emit('error', e);
        });
    }
    search() {
        if (!this.bound) {
            this.finder.bind();
        }
        else {
            this.sendServerBroadcast();
        }
    }
    async searchAsync() {
        let self = this;
        return new Promise(async (resolve, reject) => {
            try {
                debugFind(`Screenlogic finder searching for local units...`);
                let _timeout = (0, timers_1.setTimeout)(() => {
                    debugFind(`No units found searching locally.`);
                    resolve({});
                }, 2000);
                self.once('serverFound', (unit) => {
                    clearTimeout(_timeout);
                    debugFind(`Screenlogic found unit ${JSON.stringify(unit)}`);
                    resolve(unit);
                });
            }
            catch (error) {
                debugFind(`Screenlogic caught searchAsync error ${error.message}, rethrowing...`);
                throw error;
            }
            self.search();
        });
    }
    foundServer(msg, remote) {
        debugFind('found something');
        if (msg.length >= 40) {
            var server = {
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
        }
        else {
            debugFind('  unexpected message');
        }
    }
    sendServerBroadcast() {
        this.finder.send(this.message, 0, this.message.length, 1444, '255.255.255.255');
        debugFind('Looking for ScreenLogic hosts...');
    }
    close() {
        this.finder.close();
    }
}
exports.FindUnits = FindUnits;
class RemoteLogin extends events_1.EventEmitter {
    constructor(systemName) {
        super();
        this.systemName = systemName;
        this._client = new net.Socket();
        this._gateway = new OutgoingMessages_1.OutboundGateway(0, 0);
    }
    connect() {
        return new Promise((resolve, reject) => {
            debugRemote('connecting to dispatcher...');
            var self = this;
            this._client.on('data', function (buf) {
                // _this.onClientMessage(msg);
                if (buf.length > 4) {
                    let message = new SLMessage_1.Inbound(this.controllerId, exports.screenlogic.senderId);
                    message.readFromBuffer(buf);
                    var msgType = buf.readInt16LE(2);
                    debugRemote(`received message of length ${buf.length} and messageId ${message.messageId}`);
                    switch (message.messageId) {
                        case 18004: // SLGatewayDataMessage.getResponseId():
                            debugRemote("  it's a gateway response");
                            if (typeof resolve !== 'undefined') {
                                let unit = new SLGateway.SLReceiveGatewayDataMessage(buf).get();
                                resolve(unit);
                            }
                            else
                                this.emit('gatewayFound', new SLGateway.SLReceiveGatewayDataMessage(buf));
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
                    debugRemote("   message of length <= 4 received and is not valid");
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
            this._client.connect(500, 'screenlogicserver.pentair.com', function () {
                debugRemote('connected to dispatcher');
                self._client.write(self._gateway.createSendGatewayMessage(self.systemName));
            });
        });
    }
    ;
    async closeAsync() {
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
exports.RemoteLogin = RemoteLogin;
class UnitConnection extends events_1.EventEmitter {
    constructor() {
        super();
        this.isConnected = false;
        this._controllerId = 0;
        // private _expectedMsgLen: number;
        // private challengeString;
        this._senderId = 0;
        this.netTimeout = 2000; // set back to 1s after testing
        this._keepAliveDuration = 30 * 1000;
        this.client = new net.Socket();
        this.client.setKeepAlive(true, 10 * 1000);
        this._buffer = Buffer.alloc(1024);
        this._bufferIdx = 0;
    }
    get clientId() { return this._clientId; }
    ;
    set clientId(val) { this._clientId = val; }
    get controllerId() { return this._controllerId; }
    ;
    set controllerId(val) { this._controllerId = val; }
    get senderId() { return this._senderId; }
    ;
    set senderId(val) { this._senderId = val; }
    init(address, port, password, senderId) {
        let self = this;
        this.client.on('data', function (msg) {
            self.processData(msg);
        }).on('close', function (had_error) {
            debugUnit(`closed.  any error? ${had_error}`);
            self.emit('close', had_error);
        }).on('error', function (e) {
            // often, during debugging, the socket will timeout
            debugUnit(`error event for unit: ${e.message}`);
            self.emit('error', e);
        }).on('clientError', function (err, socket) {
            if (err.code === 'ECONNRESET' || !socket.writable)
                socket.end('HTTP/2 400 Bad Request\n');
            debugUnit('client error\n', err);
        });
        this.serverPort = port;
        this.serverAddress = address;
        this.password = password;
        this.senderId = senderId;
        this.clientId = Math.round(Math.random() * 100000);
        this.controller = {
            circuits: new OutgoingMessages_1.CircuitCommands(this),
            connection: new OutgoingMessages_1.ConnectionCommands(this),
            equipment: new OutgoingMessages_1.EquipmentCommands(this),
            chlor: new OutgoingMessages_1.ChlorCommands(this),
            chem: new OutgoingMessages_1.ChemCommands(this),
            schedules: new OutgoingMessages_1.ScheduleCommands(this),
            pumps: new OutgoingMessages_1.PumpCommands(this),
            bodies: new OutgoingMessages_1.BodyCommands(this)
        };
        this.circuits = new Circuit();
        this.equipment = new Equipment();
        this.bodies = new Body();
        this.chem = new Chem();
        this.chlor = new Chlor();
        this.schedule = new Schedule();
        this.pump = new Pump();
        this._keepAliveTimer = (0, timers_1.setTimeout)(async () => {
            self.keepAliveAsync();
        }, this._keepAliveDuration || 30000);
    }
    write(val) {
        try {
            this.client.write(val);
        }
        catch (err) {
            debugUnit(`Error writing to net: ${err.message}`);
        }
    }
    keepAliveAsync() {
        let self = this;
        try {
            if (!this.isConnected)
                return;
            if (typeof this._keepAliveTimer !== 'undefined' || this._keepAliveTimer)
                clearTimeout(this._keepAliveTimer);
            this._keepAliveTimer = null;
            self.pingServer().catch(err => {
                debugUnit(`Error pinging server: ${err.message}`);
            });
        }
        catch (error) {
            debugUnit("ERROR pinging server");
        }
        finally {
            this._keepAliveTimer = (0, timers_1.setTimeout)(() => {
                self.keepAliveAsync();
            }, this._keepAliveDuration || 30000);
        }
    }
    processData(msg) {
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
                let message = new SLMessage_1.Inbound(this.controllerId, this.senderId);
                message.readFromBuffer(b);
                // this.onClientMessage(this.buffer.slice(0, this.expectedMsgLen));
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
    async closeAsync() {
        let self = this;
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof this._keepAliveTimer !== 'undefined' || this._keepAliveTimer)
                    clearTimeout(this._keepAliveTimer);
                this._keepAliveTimer = null;
                if (self.client.destroyed) {
                    resolve(true);
                }
                else {
                    if (self.isConnected) {
                        let removeClient = await self.removeClient();
                        debugUnit(`Removed client: ${removeClient}`);
                    }
                    self.client.setKeepAlive(false);
                    self.client.end(() => {
                        debugUnit(`Client socket closed`);
                        resolve(true);
                    });
                    self.isConnected = false;
                    // resolve(true);
                }
            }
            catch (error) {
                debugUnit(`caught error in closeAsync ${error.message}... returning anwyay`);
                resolve(true);
            }
        });
    }
    async connectAsync() {
        return new Promise(async (resolve, reject) => {
            try {
                debugUnit('connecting...');
                var self = this;
                let connected = false;
                this.client.on('ready', () => {
                    debugUnit('connected, sending init message...');
                    self.write('CONNECTSERVERHOST\r\n\r\n');
                    debugUnit('sending challenge message...');
                    let _timeout = (0, timers_1.setTimeout)(() => {
                        if (typeof reject === 'function')
                            reject(new Error(`timeout`));
                    }, exports.screenlogic.netTimeout);
                    self.once('challengeString', async function (challengeString) {
                        debugUnit('   challenge string emit');
                        try {
                            await this.login(challengeString);
                            resolve(true);
                        }
                        catch (error) {
                            reject(error);
                        }
                        finally {
                            clearTimeout(_timeout);
                        }
                    });
                    exports.screenlogic.write(exports.screenlogic.controller.connection.createChallengeMessage());
                });
                this.client.connect(this.serverPort, this.serverAddress, function () {
                    connected = true;
                });
            }
            catch (error) {
                debugUnit(`Caught connectAsync error ${error.message}; rethrowing...`);
                throw error;
            }
        });
    }
    async login(challengeString) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            debugUnit('sending login message...');
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for challenge string'));
            }, exports.screenlogic.netTimeout);
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
            });
            var password = new Encoder(this.password).getEncryptedPassword(challengeString);
            exports.screenlogic.write(exports.screenlogic.controller.connection.createLoginMessage(password));
        });
    }
    async getVersion() {
        let self = this;
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending version query...', this.senderId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for version'));
            }, exports.screenlogic.netTimeout);
            self.once('version', (version) => {
                clearTimeout(_timeout);
                debugUnit('received version event');
                resolve(version);
            });
            exports.screenlogic.write(exports.screenlogic.controller.connection.createVersionMessage());
        });
    }
    async addClient(clientId) {
        let self = this;
        if (clientId)
            this.clientId = clientId;
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending add client command, clientId %d...', self.senderId, self.clientId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for add client response'));
            }, exports.screenlogic.netTimeout);
            self.once('addClient', (clientAck) => {
                clearTimeout(_timeout);
                debugUnit('received addClient event');
                resolve(true);
            });
            self.write(self.controller.connection.createAddClientMessage());
        });
    }
    async removeClient() {
        let self = this;
        return new Promise(async (resolve, reject) => {
            try {
                debugUnit(`[${this.senderId}] sending remove client command, clientId ${this.clientId}...`);
                let _timeout = (0, timers_1.setTimeout)(() => {
                    reject(new Error('time out waiting for remove client response'));
                }, exports.screenlogic.netTimeout);
                self.once('removeClient', (clientAck) => {
                    clearTimeout(_timeout);
                    debugUnit('received removeClient event');
                    resolve(true);
                });
                exports.screenlogic.write(exports.screenlogic.controller.connection.createRemoveClientMessage());
            }
            catch (error) {
                debugUnit(`caught remove client error ${error.message}, rethrowing...`);
                throw error;
            }
        });
    }
    async pingServer() {
        let self = this;
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] pinging server', this.senderId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for ping server response'));
            }, exports.screenlogic.netTimeout);
            self.once('pong', (pong) => {
                clearTimeout(_timeout);
                debugUnit('received pong event');
                resolve(true);
            });
            exports.screenlogic.write(exports.screenlogic.controller.connection.createPingMessage());
        });
    }
    onClientMessage(msg) {
        debugUnit('received message of length %d', msg.length);
        // var msgType = buf.readInt16LE(2);
        // console.log(`got a message ${msg.messageId}`)
        switch (msg.messageId) {
            case 15: //SLChallengeMessage.getResponseId():
                debugUnit("  it's a challenge response");
                let challengeString = ConnectionMessage_1.ConnectionMessage.decodeChallengeResponse(msg);
                this.emit('challengeString', challengeString);
                // this.login(challengeString);
                break;
            case 28: //SLLoginMessage.getResponseId():
                debugUnit("  it's a login response");
                this.emit('loggedIn');
                break;
            case 13:
                debugUnit("  it's a login failure.");
                this.emit('loginFailed');
                break;
            case 12500: //SLPoolStatusMessage.getAsyncResponseId():
            case 12527: //SLPoolStatusMessage.getResponseId():
                debugUnit("  it's pool status");
                let equipmentState = EquipmentState_1.EquipmentStateMessage.decodeEquipmentStateResponse(msg);
                this.emit('equipmentState', equipmentState);
                break;
            case 8121: // SLVersionMessage.getResponseId():
                debugUnit("  it's version");
                let ver = ConnectionMessage_1.ConnectionMessage.decodeVersionResponse(msg);
                this.emit('version', ver);
                break;
            case 12573: // SLIntellichlorConfigMessage.getResponseId():
                debugUnit("  it's salt cell config");
                this.emit('intellichlorConfig', ChlorMessage_1.ChlorMessage.decodeIntellichlorConfig(msg));
                break;
            case 12533: // SLEquipmentConfigMessage.getResponseId():
                debugUnit("  it's controller configuration");
                this.emit('equipmentConfig', EquipmentConfig_1.EquipmentConfigurationMessage.decodeControllerConfig(msg));
                break;
            case 12505: // SLChemDataMessage.getAsyncResponseId():
            case 12593: // SLChemDataMessage.getResponseId():
                debugUnit("  it's chem data");
                this.emit('chemicalData', ChemMessage_1.ChemMessage.decodeChemDataMessage(msg));
                break;
            case 8111: // SLGetSystemTime.getResponseId():
                debugUnit("  it's system time");
                this.emit('getSystemTime', EquipmentState_1.EquipmentStateMessage.decodeSystemTime(msg));
                break;
            case 12543: // SLGetScheduleData.getResponseId():
                debugUnit("  it's schedule data");
                this.emit('getScheduleData', ScheduleMessage_1.ScheduleMessage.decodeGetScheduleMessage(msg));
                break;
            case 12581: // SLCancelDelay.getResponseId():
                debugUnit("  it's a cancel delay ack");
                this.emit('cancelDelay', EquipmentState_1.EquipmentStateMessage.decodeCancelDelay(msg));
                break;
            case 12523: // SLAddClient.getResponseId():
                debugUnit("  it's an add client ack");
                this.emit('addClient', ConnectionMessage_1.ConnectionMessage.decodeAddClient(msg));
                break;
            case 12525: // SLRemoveClient.getResponseId():
                debugUnit("  it's a remove client ack");
                this.emit('removeClient', ConnectionMessage_1.ConnectionMessage.decodeRemoveClient(msg));
                break;
            case 17: // SLPingServerMessage.getResponseId():
                debugUnit("  it's a pong");
                this.emit('pong', ConnectionMessage_1.ConnectionMessage.decodePingClient(msg));
                break;
            case 12567: // SLEquipmentConfigurationMessage.getResponseId():
                debugUnit("  it's equipment configuration");
                this.emit('equipmentConfiguration', EquipmentConfig_1.EquipmentConfigurationMessage.decodeEquipmentConfiguration(msg));
                break;
            case 12585: // SLGetPumpStatus.getResponseId():
                debugUnit("  it's pump status");
                this.emit('getPumpStatus', PumpMessage_1.PumpMessage.decodePumpStatus(msg));
                break;
            case 9808: // SLGetWeatherForecast.getResponseId():
                debugUnit("  it's a weather forecast ack");
                this.emit('weatherForecast', EquipmentConfig_1.EquipmentConfigurationMessage.decodeWeatherMessage(msg));
                break;
            case 12531: // SLSetCircuitStateMessage.getResponseId():
                debugUnit("  it's circuit toggle ack");
                this.emit('circuitStateChanged', CircuitMessage_1.CircuitMessage.decodeSetCircuitState(msg));
                break;
            case 12529: // SLSetHeatSetPointMessage.getResponseId():
                debugUnit("  it's a setpoint ack");
                this.emit('setPointChanged', HeaterMessage_1.HeaterMessage.decodeSetHeatSetPoint(msg));
                break;
            case 12539: // SLSetHeatModeMessage.getResponseId():
                debugUnit("  it's a heater mode ack");
                this.emit('heatModeChanged', HeaterMessage_1.HeaterMessage.decodeSetHeatModePoint(msg));
                break;
            case 12557: // SLLightControlMessage.getResponseId():
                debugUnit("  it's a light control ack");
                this.emit('sentLightCommand', CircuitMessage_1.CircuitMessage.decodeSetLight(msg));
                break;
            case 12504: // ~16-20s sequence intellibrite light theme
                debugUnit("  it's a light sequence delay packet");
                this.emit('intellibriteDelay', 1);
                break;
            case 12577: // SLSetIntellichlorConfigMessage.getResponseId():
                debugUnit("  it's a set salt cell config ack");
                this.emit('setIntellichlorConfig', ChlorMessage_1.ChlorMessage.decodeSetIntellichlorConfig(msg));
                break;
            case 12545: // SLAddNewScheduleEvent.getResponseId():
                debugUnit("  it's a new schedule event ack");
                this.emit('addNewScheduleEvent', ScheduleMessage_1.ScheduleMessage.decodeAddSchedule(msg));
                break;
            case 12547: // SLDeleteScheduleEventById.getResponseId():
                debugUnit("  it's a delete schedule event ack");
                this.emit('deleteScheduleEventById', ScheduleMessage_1.ScheduleMessage.decodeDeleteSchedule(msg));
                break;
            case 12549: // SLSetScheduleEventById.getResponseId():
                debugUnit("  it's a set schedule event ack");
                this.emit('setScheduleEventById', ScheduleMessage_1.ScheduleMessage.decodeSetSchedule(msg));
                break;
            case 12550: // SLSetCircuitRuntimeById.getResponseId():
                debugUnit("  it's a set circuit runtime ack");
                this.emit('setCircuitRuntimebyId', CircuitMessage_1.CircuitMessage.decodeSetCircuitRunTime(msg));
                break;
            case 12563:
                debugUnit("  it's a get custom names packet");
                this.emit('getCustomNames', EquipmentConfig_1.EquipmentConfigurationMessage.decodeCustomNames(msg));
                break;
            case 12587: // SLSetPumpSpeed.getResponseId():
                debugUnit("  it's a set pump flow ack");
                this.emit('setPumpSpeed', PumpMessage_1.PumpMessage.decodeSetPumpSpeed(msg));
                break;
            // ------------  ASYNC MESSAGES --------------- //
            case 8113: // SLSetSystemTime.getResponseId():
                debugUnit("  it's a set system time ack");
                this.emit('setSystemTime', EquipmentState_1.EquipmentStateMessage.decodeSetSystemTime(msg));
                break;
            case 12535: // SLGetHistoryData.getResponseId():
                debugUnit("  it's a history data query ack");
                this.emit('getHistoryDataPending');
                break;
            case 12502: // SLGetHistoryData.getPayloadId():
                debugUnit("  it's a history data payload");
                this.emit('getHistoryData', EquipmentConfig_1.EquipmentConfigurationMessage.decodeGetHistory(msg));
                break;
            case 12597: // SLGetChemHistoryData.getResponseId():
                debugUnit("  it's a chem history data query ack");
                this.emit('getChemHistoryDataPending');
                break;
            case 12506: // SLGetChemHistoryData.getPayloadId():
                debugUnit("  it's a chem history data payload");
                this.emit('getChemHistoryData', ChemMessage_1.ChemMessage.decodecChemHistoryMessage(msg));
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
                EquipmentState_1.EquipmentStateMessage.decodeGeneric(msg);
                debugUnit("  it's an unknown type: %d", msg.messageId);
                break;
        }
    }
}
exports.UnitConnection = UnitConnection;
exports.screenlogic = new UnitConnection();
class Equipment {
    async setSystemTime(date, shouldAdjustForDST) {
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
            debugUnit('[%d] sending set system time command...', exports.screenlogic.senderId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for set system time response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('setSystemTime', (data) => {
                clearTimeout(_timeout);
                debugUnit('received setSystemTime event');
                resolve(data);
            });
            exports.screenlogic.write(exports.screenlogic.controller.equipment.createSetSystemTimeMessage(date, shouldAdjustForDST));
        });
    }
    async getWeatherForecast() {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] requesting weather forecast', exports.screenlogic.senderId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for weather forecast response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('weatherForecast', (equipment) => {
                clearTimeout(_timeout);
                debugUnit('received weatherForecast event');
                resolve(equipment);
            });
            exports.screenlogic.write(exports.screenlogic.controller.equipment.createWeatherMessage());
        });
    }
    async getHistoryData(fromTime, toTime) {
        return new Promise(async (resolve, reject) => {
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for get history response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('getHistoryData', (data) => {
                clearTimeout(_timeout);
                debugUnit('received getHistoryData event');
                resolve(data);
            });
            let now = new Date();
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            debugUnit('[%d] requesting history data from `%s` to `%s`', exports.screenlogic.senderId, fromTime || yesterday, toTime || now);
            exports.screenlogic.write(exports.screenlogic.controller.equipment.createGetHistoryMessage(fromTime || yesterday, toTime || now));
        });
    }
    async getEquipmentConfiguration() {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending equipment configuration query...', exports.screenlogic.senderId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for equipment configuration response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('equipmentConfiguration', (data) => {
                clearTimeout(_timeout);
                debugUnit('received equipmentConfiguration event');
                resolve(data);
            });
            exports.screenlogic.write(exports.screenlogic.controller.equipment.createGetEquipmentConfigurationMessage());
        });
    }
    async cancelDelay() {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending cancel delay command...', exports.screenlogic.senderId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting to cancel delays'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('cancelDelay', (delay) => {
                clearTimeout(_timeout);
                debugUnit('received cancelDelay event');
                resolve(true);
            });
            exports.screenlogic.write(exports.screenlogic.controller.equipment.createCancelDelayMessage());
        });
    }
    async getSystemTime() {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending get system time query...', exports.screenlogic.senderId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for chemical config'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('getSystemTime', (systemTime) => {
                clearTimeout(_timeout);
                debugUnit('received getSystemTime event');
                resolve(systemTime);
            });
            exports.screenlogic.write(exports.screenlogic.controller.equipment.createGetSystemTimeMessage());
        });
    }
    async getControllerConfig() {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending controller config query...', exports.screenlogic.senderId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for controller config'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('equipmentConfig', (controller) => {
                clearTimeout(_timeout);
                debugUnit('received equipmentConfig event');
                resolve(controller);
            });
            exports.screenlogic.write(exports.screenlogic.controller.equipment.createGetControllerConfigMessage());
        });
    }
    async getEquipmentState() {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending pool status query...', exports.screenlogic.senderId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for pool status'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('equipmentState', (equipmentState) => {
                clearTimeout(_timeout);
                debugUnit('received equipmentState event');
                resolve(equipmentState);
            });
            exports.screenlogic.write(exports.screenlogic.controller.equipment.createEquipmentStateMessage());
        });
    }
    async getCustomNames() {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending get custom names: %d...', exports.screenlogic.senderId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for custom names'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('getCustomNames', (customNames) => {
                clearTimeout(_timeout);
                debugUnit('received getCustomNames event');
                resolve(customNames);
            });
            exports.screenlogic.write(exports.screenlogic.controller.equipment.createGetCustomNamesMessage());
        });
    }
}
exports.Equipment = Equipment;
class Circuit extends UnitConnection {
    async sendLightCommand(command) {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending light command: controllerId: %d, command: %d...', exports.screenlogic.senderId, this.controllerId, command);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for light command response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('sentLightCommand', (data) => {
                clearTimeout(_timeout);
                debugUnit('received sentLightCommand event');
                resolve(data);
            });
            exports.screenlogic.write(exports.screenlogic.controller.circuits.createIntellibriteMessage(command));
        });
    }
    async setCircuitRuntimebyId(circuitId, runTime) {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending set circuit runtime command for circuitId: %d, runTime: %d...', exports.screenlogic.senderId, circuitId, runTime);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for set circuit run time response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('setCircuitRuntimebyId', (data) => {
                clearTimeout(_timeout);
                debugUnit('received setCircuitRuntimebyId event');
                resolve(data);
            });
            exports.screenlogic.write(exports.screenlogic.controller.circuits.createSetCircuitRuntimeMessage(circuitId, runTime));
        });
    }
    async setCircuitState(circuitId, circuitState) {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending set circuit state command: controllerId: %d, circuitId: %d, circuitState: %d...', exports.screenlogic.senderId, this.controllerId, circuitId, circuitState);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for set circuit state response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('circuitStateChanged', (data) => {
                clearTimeout(_timeout);
                debugUnit('received circuitStateChanged event');
                resolve(data);
            });
            exports.screenlogic.write(exports.screenlogic.controller.circuits.createSetCircuitMessage(circuitId, circuitState));
        });
    }
}
exports.Circuit = Circuit;
class Body extends UnitConnection {
    async setSetPoint(bodyIndex, temperature) {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending set setpoint command: controllerId: %d, bodyIndex: %d, temperature: %d...', exports.screenlogic.senderId, this.controllerId, bodyIndex, temperature);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for body setpoint response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('setPointChanged', (data) => {
                clearTimeout(_timeout);
                debugUnit('received setPointChanged event');
                resolve(data);
            });
            exports.screenlogic.write(exports.screenlogic.controller.bodies.createSetPointMessage(bodyIndex, temperature));
        });
    }
    async setHeatMode(bodyIndex, heatMode) {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending set heatmode command: controllerId: %d, bodyIndex: %d, heatMode: %d...', exports.screenlogic.senderId, this.controllerId, bodyIndex, heatMode);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for body heat mode response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('heatModeChanged', (data) => {
                clearTimeout(_timeout);
                debugUnit('received heatModeChanged event');
                resolve(data);
            });
            exports.screenlogic.write(exports.screenlogic.controller.bodies.createHeatModeMessage(bodyIndex, heatMode));
        });
    }
}
exports.Body = Body;
class Pump extends UnitConnection {
    async setPumpSpeed(pumpId, circuitId, speed, isRPMs) {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending set pump flow command for pumpId: %d, circuitId: %d, setPoint: %d, isRPMs: %d...', exports.screenlogic.senderId, pumpId, circuitId, speed, isRPMs);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for set pump speed response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('setPumpSpeed', (data) => {
                clearTimeout(_timeout);
                debugUnit('received setPumpSpeed event');
                resolve(data);
            });
            exports.screenlogic.write(exports.screenlogic.controller.pumps.setPumpSpeed(pumpId, circuitId, speed, isRPMs));
        });
    }
    async getPumpStatus(pumpId) {
        return new Promise(async (resolve, reject) => {
            try {
                debugUnit('[%d] sending get pump status command for pumpId: %d...', exports.screenlogic.senderId, pumpId);
                let _timeout = (0, timers_1.setTimeout)(() => {
                    reject(new Error('time out waiting for pump status response'));
                }, exports.screenlogic.netTimeout);
                exports.screenlogic.once('getPumpStatus', (data) => {
                    clearTimeout(_timeout);
                    debugUnit('received getPumpStatus event');
                    resolve(data);
                });
                exports.screenlogic.write(exports.screenlogic.controller.pumps.createPumpStatusMessage(pumpId));
            }
            catch (err) {
                debugUnit(`Error getting pump status: ${err.message}`);
                reject(err);
            }
        });
    }
}
exports.Pump = Pump;
class Schedule extends UnitConnection {
    async setScheduleEventById(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint) {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending set schedule event command for scheduleId: %d, circuitId: %d, startTime: %d, stopTime: %d, dayMask: %d, flags: %d, heatCmd: %d, heatSetPoint: %d...', exports.screenlogic.senderId, scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for set schedule response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('setScheduleEventById', (data) => {
                clearTimeout(_timeout);
                debugUnit('received setScheduleEventById event');
                resolve(data);
            });
            exports.screenlogic.write(exports.screenlogic.controller.schedules.createSetScheduleEventMessage(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint));
        });
    }
    async addNewScheduleEvent(scheduleType) {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending add new schedule event command for scheduleType: %d...', exports.screenlogic.senderId, scheduleType);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for add new schedule response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('addNewScheduleEvent', (data) => {
                clearTimeout(_timeout);
                debugUnit('received addNewScheduleEvent event');
                resolve(data);
            });
            exports.screenlogic.write(exports.screenlogic.controller.schedules.createAddScheduleEventMessage(scheduleType));
        });
    }
    async deleteScheduleEventById(scheduleId) {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending delete schedule event command for scheduleId: %d...', exports.screenlogic.senderId, scheduleId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for delete schedule response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('deleteScheduleEventById', (data) => {
                clearTimeout(_timeout);
                debugUnit('received deleteScheduleEventById event');
                resolve(data);
            });
            exports.screenlogic.write(exports.screenlogic.controller.schedules.createDeleteScheduleEventMessage(scheduleId));
        });
    }
    async getScheduleData(scheduleType) {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending get schedule data query for scheduleType: %d...', exports.screenlogic.senderId, scheduleType);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for schedule data'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('getScheduleData', (schedule) => {
                clearTimeout(_timeout);
                debugUnit('received getScheduleData event');
                resolve(schedule);
            });
            exports.screenlogic.write(exports.screenlogic.controller.schedules.createGetSchedulesMessage(scheduleType));
        });
    }
}
exports.Schedule = Schedule;
class Chem extends UnitConnection {
    async getChemHistoryData(fromTime, toTime) {
        return new Promise(async (resolve, reject) => {
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for get chem history response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('getChemHistoryData', (data) => {
                clearTimeout(_timeout);
                debugUnit('received getChemHistoryData event');
                resolve(data);
            });
            let now = new Date();
            let yesterday = new Date();
            debugUnit('[%d] requesting chem history data from `%s` to `%s`', exports.screenlogic.senderId, fromTime || yesterday, toTime || now);
            yesterday.setHours(now.getHours() - 24);
            exports.screenlogic.write(exports.screenlogic.controller.chem.createGetChemHistoryMessage(fromTime || yesterday, toTime || now));
        });
    }
    async getChemicalData() {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending chemical data query...', exports.screenlogic.senderId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for chemical config'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('chemicalData', (chemical) => {
                clearTimeout(_timeout);
                debugUnit('received chemicalData event');
                resolve(chemical);
            });
            exports.screenlogic.write(exports.screenlogic.controller.chem.createChemStatusMessage());
        });
    }
}
exports.Chem = Chem;
class Chlor extends UnitConnection {
    async setIntellichlorOutput(poolOutput, spaOutput) {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending set intellichlor output command: controllerId: %d, poolOutput: %d, spaOutput: %d...', exports.screenlogic.senderId, this.controllerId, poolOutput, spaOutput);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for set intellichlor response'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('setIntellichlorConfig', (equipment) => {
                clearTimeout(_timeout);
                debugUnit('received setIntellichlorConfig event');
                resolve(equipment);
            });
            exports.screenlogic.write(exports.screenlogic.controller.chlor.createSetChlorOutputMessage(poolOutput, spaOutput));
        });
    }
    async getIntellichlorConfig() {
        return new Promise(async (resolve, reject) => {
            debugUnit('[%d] sending salt cell config query...', exports.screenlogic.senderId);
            let _timeout = (0, timers_1.setTimeout)(() => {
                reject(new Error('time out waiting for intellichlor config'));
            }, exports.screenlogic.netTimeout);
            exports.screenlogic.once('intellichlorConfig', (intellichlor) => {
                clearTimeout(_timeout);
                debugUnit('received intellichlorConfig event');
                resolve(intellichlor);
            });
            exports.screenlogic.write(exports.screenlogic.controller.chlor.createSaltCellConfigMessage());
        });
    }
}
exports.Chlor = Chlor;
/* debug print full buffer contents:
for (const value of buf.values()) {
  //console.log(value.toString(16));
}
*/
var LightCommands;
(function (LightCommands) {
    LightCommands[LightCommands["LIGHT_CMD_LIGHTS_OFF"] = 0] = "LIGHT_CMD_LIGHTS_OFF";
    LightCommands[LightCommands["LIGHT_CMD_LIGHTS_ON"] = 1] = "LIGHT_CMD_LIGHTS_ON";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_SET"] = 2] = "LIGHT_CMD_COLOR_SET";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_SYNC"] = 3] = "LIGHT_CMD_COLOR_SYNC";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_SWIM"] = 4] = "LIGHT_CMD_COLOR_SWIM";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_MODE_PARTY"] = 5] = "LIGHT_CMD_COLOR_MODE_PARTY";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_MODE_ROMANCE"] = 6] = "LIGHT_CMD_COLOR_MODE_ROMANCE";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_MODE_CARIBBEAN"] = 7] = "LIGHT_CMD_COLOR_MODE_CARIBBEAN";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_MODE_AMERICAN"] = 8] = "LIGHT_CMD_COLOR_MODE_AMERICAN";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_MODE_SUNSET"] = 9] = "LIGHT_CMD_COLOR_MODE_SUNSET";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_MODE_ROYAL"] = 10] = "LIGHT_CMD_COLOR_MODE_ROYAL";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_SET_SAVE"] = 11] = "LIGHT_CMD_COLOR_SET_SAVE";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_SET_RECALL"] = 12] = "LIGHT_CMD_COLOR_SET_RECALL";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_BLUE"] = 13] = "LIGHT_CMD_COLOR_BLUE";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_GREEN"] = 14] = "LIGHT_CMD_COLOR_GREEN";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_RED"] = 15] = "LIGHT_CMD_COLOR_RED";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_WHITE"] = 16] = "LIGHT_CMD_COLOR_WHITE";
    LightCommands[LightCommands["LIGHT_CMD_COLOR_PURPLE"] = 17] = "LIGHT_CMD_COLOR_PURPLE";
})(LightCommands = exports.LightCommands || (exports.LightCommands = {}));
var HeatModes;
(function (HeatModes) {
    HeatModes[HeatModes["HEAT_MODE_OFF"] = 0] = "HEAT_MODE_OFF";
    HeatModes[HeatModes["HEAT_MODE_SOLAR"] = 1] = "HEAT_MODE_SOLAR";
    HeatModes[HeatModes["HEAT_MODE_SOLARPREFERRED"] = 2] = "HEAT_MODE_SOLARPREFERRED";
    HeatModes[HeatModes["HEAT_MODE_HEATPUMP"] = 3] = "HEAT_MODE_HEATPUMP";
    HeatModes[HeatModes["HEAT_MODE_HEATER"] = 3] = "HEAT_MODE_HEATER";
    HeatModes[HeatModes["HEAT_MODE_DONTCHANGE"] = 4] = "HEAT_MODE_DONTCHANGE";
})(HeatModes = exports.HeatModes || (exports.HeatModes = {}));
var PumpTypes;
(function (PumpTypes) {
    PumpTypes[PumpTypes["PUMP_TYPE_INTELLIFLOVF"] = 5] = "PUMP_TYPE_INTELLIFLOVF";
    PumpTypes[PumpTypes["PUMP_TYPE_INTELLIFLOVS"] = 3] = "PUMP_TYPE_INTELLIFLOVS";
    PumpTypes[PumpTypes["PUMP_TYPE_INTELLIFLOVSF"] = 4] = "PUMP_TYPE_INTELLIFLOVSF";
})(PumpTypes = exports.PumpTypes || (exports.PumpTypes = {}));
;
var BodyIndex;
(function (BodyIndex) {
    BodyIndex[BodyIndex["POOL"] = 0] = "POOL";
    BodyIndex[BodyIndex["SPA"] = 1] = "SPA";
})(BodyIndex = exports.BodyIndex || (exports.BodyIndex = {}));
var SchedTypes;
(function (SchedTypes) {
    SchedTypes[SchedTypes["RECURRING"] = 0] = "RECURRING";
    SchedTypes[SchedTypes["RUNONCE"] = 1] = "RUNONCE";
})(SchedTypes = exports.SchedTypes || (exports.SchedTypes = {}));
//# sourceMappingURL=index.js.map