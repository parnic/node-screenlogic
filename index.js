'use strict';
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.SchedTypes = exports.BodyIndex = exports.PumpTypes = exports.HeatModes = exports.LightCommands = exports.Chlor = exports.Chem = exports.Schedule = exports.Pump = exports.Body = exports.Circuit = exports.Equipment = exports.screenlogic = exports.UnitConnection = exports.RemoteLogin = exports.FindUnits = void 0;
require("source-map-support/register");
var dgram = require('dgram');
var net = require("net");
var events_1 = require("events");
// import * as messages from './messages';
var SLGateway = require("./messages/SLGatewayDataMessage");
// import { SLChemData, SLControllerConfigData, SLIntellichlorData, SLPoolStatusData, SLReceivePoolStatusMessage, SLScheduleData, SLSystemTimeData } from './messages';
// import { SLPoolStatusData } from './messages/SLPoolStatusMessage';
// import { SLIntellichlorData } from './messages/SLIntellichlorConfigMessage';
// import { SLControllerConfigData } from './messages/SLControllerConfigMessage';
// import { SLChemData, SLScheduleData, SLSystemTimeData } from './messages';
var OutgoingMessages_1 = require("./messages/OutgoingMessages");
var ConnectionMessage_1 = require("./messages/state/ConnectionMessage");
// import { Inbound } from './messages/SLMessage';
var EquipmentStateMessage_1 = require("./messages/state/EquipmentStateMessage");
var ChlorMessage_1 = require("./messages/state/ChlorMessage");
var ChemMessage_1 = require("./messages/state/ChemMessage");
var ScheduleMessage_1 = require("./messages/state/ScheduleMessage");
var PumpMessage_1 = require("./messages/state/PumpMessage");
var CircuitMessage_1 = require("./messages/state/CircuitMessage");
var HeaterMessage_1 = require("./messages/state/HeaterMessage");
var SLMessage_1 = require("./messages/SLMessage");
var Encoder = require('./PasswordEncoder').HLEncoder;
var debugFind = require('debug')('sl:find');
var debugRemote = require('debug')('sl:remote');
var debugUnit = require('debug')('sl:unit');
var FindUnits = /** @class */ (function (_super) {
    __extends(FindUnits, _super);
    function FindUnits() {
        var _this_1 = _super.call(this) || this;
        _this_1.message = Buffer.alloc(8);
        _this_1.message[0] = 1;
        _this_1.finder = dgram.createSocket('udp4');
        var _this = _this_1;
        _this_1.finder.on('listening', function () {
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
        return _this_1;
    }
    FindUnits.prototype.search = function () {
        if (!this.bound) {
            "";
            this.finder.bind();
        }
        else {
            this.sendServerBroadcast();
        }
    };
    FindUnits.prototype.foundServer = function (msg, remote) {
        debugFind('found something');
        if (msg.length >= 40) {
            var server = {
                address: remote.address,
                type: msg.readInt32LE(0),
                port: msg.readInt16LE(8),
                gatewayType: msg.readUInt8(10),
                gatewaySubtype: msg.readUInt8(11),
                gatewayName: msg.toString('utf8', 12, 29)
            };
            debugFind('  type: ' + server.type + ', host: ' + server.address + ':' + server.port + ', identified as ' + server.gatewayName);
            if (server.type === 2) {
                this.emit('serverFound', server);
            }
        }
        else {
            debugFind('  unexpected message');
        }
    };
    FindUnits.prototype.sendServerBroadcast = function () {
        this.finder.send(this.message, 0, this.message.length, 1444, '255.255.255.255');
        debugFind('Looking for ScreenLogic hosts...');
    };
    FindUnits.prototype.close = function () {
        this.finder.close();
    };
    return FindUnits;
}(events_1.EventEmitter));
exports.FindUnits = FindUnits;
var RemoteLogin = /** @class */ (function (_super) {
    __extends(RemoteLogin, _super);
    function RemoteLogin(systemName) {
        var _this_1 = _super.call(this) || this;
        _this_1.systemName = systemName;
        _this_1._client = new net.Socket();
        _this_1._gateway = new OutgoingMessages_1.OutboundGateway(0, 0);
        return _this_1;
    }
    RemoteLogin.prototype.connect = function () {
        var _this_1 = this;
        return new Promise(function (resolve, reject) {
            debugRemote('connecting to dispatcher...');
            var self = _this_1;
            _this_1._client.on('data', function (buf) {
                // _this.onClientMessage(msg);
                debugRemote('received message of length ' + buf.length);
                if (buf.length > 4) {
                    var message = new SLMessage_1.Inbound(this.controllerId, exports.screenlogic.senderId);
                    message.readFromBuffer(buf);
                    var msgType = buf.readInt16LE(2);
                    switch (message.messageId) {
                        case 18004: // SLGatewayDataMessage.getResponseId():
                            debugRemote("  it's a gateway response");
                            if (typeof resolve !== 'undefined') {
                                var unit = new SLGateway.SLReceiveGatewayDataMessage(buf).get();
                                resolve(unit);
                            }
                            else
                                this.emit('gatewayFound', new SLGateway.SLReceiveGatewayDataMessage(buf));
                            break;
                        default:
                            debugRemote("  it's unknown. type: " + msgType);
                            if (typeof reject !== 'undefined') {
                                reject(new Error("Message on unknown type (".concat(msgType, ") received.")));
                            }
                            break;
                    }
                }
                else {
                    debugRemote("   message of length <= 4 received but is not valid");
                    if (typeof reject !== 'undefined') {
                        reject(new Error("Message of length <= 4 is invalid."));
                    }
                }
                self.close();
            }).on('close', function (had_error) {
                debugRemote('remote login server connection closed');
                self.emit('close', had_error);
            }).on('error', function (e) {
                debugRemote('error: %o', e);
                if (typeof reject !== 'undefined') {
                    reject(e);
                }
                else
                    self.emit('error', e);
            });
            _this_1._client.connect(500, 'screenlogicserver.pentair.com', function () {
                debugRemote('connected to dispatcher');
                self._client.write(self._gateway.createSendGatewayMessage(self.systemName));
            });
        });
    };
    ;
    RemoteLogin.prototype.close = function () {
        this._client.end();
    };
    return RemoteLogin;
}(events_1.EventEmitter));
exports.RemoteLogin = RemoteLogin;
var UnitConnection = /** @class */ (function (_super) {
    __extends(UnitConnection, _super);
    function UnitConnection() {
        var _this_1 = _super.call(this) || this;
        _this_1._controllerId = 0;
        // private _expectedMsgLen: number;
        // private challengeString;
        _this_1._senderId = 0;
        _this_1.netTimeout = 1000;
        _this_1._keepAliveDuration = 30 * 1000;
        _this_1.client = new net.Socket();
        _this_1.client.setKeepAlive(true, 10 * 1000);
        _this_1._buffer = Buffer.alloc(1024);
        _this_1._bufferIdx = 0;
        // this._expectedMsgLen = 0;
        var self = _this_1;
        return _this_1;
        // this.SLMessages.init(this);
    }
    Object.defineProperty(UnitConnection.prototype, "clientId", {
        get: function () { return this._clientId; },
        set: function (val) { this._clientId = val; },
        enumerable: false,
        configurable: true
    });
    ;
    Object.defineProperty(UnitConnection.prototype, "controllerId", {
        get: function () { return this._controllerId; },
        set: function (val) { this._controllerId = val; },
        enumerable: false,
        configurable: true
    });
    ;
    Object.defineProperty(UnitConnection.prototype, "senderId", {
        get: function () { return this._senderId; },
        set: function (val) { this._senderId = val; },
        enumerable: false,
        configurable: true
    });
    ;
    UnitConnection.prototype.init = function (address, port, password, senderId) {
        var _this_1 = this;
        var self = this;
        this.client.on('data', function (msg) {
            self.processData(msg);
        }).on('close', function (had_error) {
            debugUnit('closed');
            self.emit('close', had_error);
        }).on('error', function (e) {
            debugUnit('error: %o', e);
            self.emit('error', e);
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
        this._keepAliveTimer = setTimeout(function () { return __awaiter(_this_1, void 0, void 0, function () {
            return __generator(this, function (_a) {
                self.keepAliveAsync();
                return [2 /*return*/];
            });
        }); }, this._keepAliveDuration || 30000);
    };
    UnitConnection.prototype.write = function (val) {
        this.client.write(val);
    };
    UnitConnection.prototype.keepAliveAsync = function () {
        var self = this;
        try {
            if (typeof this._keepAliveTimer !== 'undefined' || this._keepAliveTimer)
                clearTimeout(this._keepAliveTimer);
            this._keepAliveTimer = null;
            self.pingServer()["catch"](function (err) {
                debugUnit("Error pinging server: ".concat(err.message));
            });
        }
        catch (error) {
            debugUnit("ERROR pinging server");
        }
        finally {
            this._keepAliveTimer = setTimeout(function () {
                self.keepAliveAsync();
            }, this._keepAliveDuration || 30000);
        }
    };
    UnitConnection.prototype.processData = function (msg) {
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
        var toRead = Math.min(this._expectedMsgLen, msg.length);
        msg.copy(this._buffer, this._bufferIdx, 0, toRead);
        this._bufferIdx = this._bufferIdx + toRead;
        // once we've read the expected length, we have a full message to handle
        if (this._bufferIdx === this._expectedMsgLen) {
            var b = this._buffer.slice(0, this._expectedMsgLen);
            if (b.length > 4) {
                var message = new SLMessage_1.Inbound(this.controllerId, this.senderId);
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
    };
    UnitConnection.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var removeClient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof this._keepAliveTimer !== 'undefined' || this._keepAliveTimer)
                            clearTimeout(this._keepAliveTimer);
                        this._keepAliveTimer = null;
                        return [4 /*yield*/, this.removeClient()];
                    case 1:
                        removeClient = _a.sent();
                        console.log("Removed client: ".concat(removeClient));
                        this.client.setKeepAlive(false);
                        this.client.end(function () {
                            debugUnit("Client socket closed");
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    UnitConnection.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var self;
                        return __generator(this, function (_a) {
                            debugUnit('connecting...');
                            self = this;
                            this.client.connect(this.serverPort, this.serverAddress, function () {
                                // _this.onConnected();
                                debugUnit('connected');
                                debugUnit('sending init message...');
                                self.write('CONNECTSERVERHOST\r\n\r\n');
                                debugUnit('sending challenge message...');
                                var _timeout = setTimeout(function () {
                                    if (typeof reject === 'function')
                                        reject(new Error("timeout"));
                                }, exports.screenlogic.netTimeout);
                                self.once('loggedIn', function () {
                                    resolve(true);
                                    clearTimeout(_timeout);
                                    reject = undefined;
                                }).once('loginFailed', function () {
                                    reject(new Error("Login Failed"));
                                    clearTimeout(_timeout);
                                    reject = undefined;
                                });
                                exports.screenlogic.write(exports.screenlogic.controller.connection.createChallengeMessage());
                            });
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    UnitConnection.prototype.login = function (challengeString) {
        debugUnit('sending login message...');
        var password = new Encoder(this.password).getEncryptedPassword(challengeString);
        exports.screenlogic.write(exports.screenlogic.controller.connection.createLoginMessage(password));
    };
    UnitConnection.prototype.getVersion = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self;
            var _this_1 = this;
            return __generator(this, function (_a) {
                self = this;
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending version query...', this.senderId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for version'));
                            }, exports.screenlogic.netTimeout);
                            self.once('version', function (version) {
                                clearTimeout(_timeout);
                                debugUnit('received version event');
                                resolve(version);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.connection.createVersionMessage());
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    UnitConnection.prototype.addClient = function (clientId) {
        return __awaiter(this, void 0, void 0, function () {
            var self;
            var _this_1 = this;
            return __generator(this, function (_a) {
                self = this;
                if (clientId)
                    this.clientId = clientId;
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending add client command, clientId %d...', self.senderId, self.clientId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for add client response'));
                            }, exports.screenlogic.netTimeout);
                            self.once('addClient', function (clientAck) {
                                clearTimeout(_timeout);
                                debugUnit('received addClient event');
                                resolve(true);
                            });
                            self.write(self.controller.connection.createAddClientMessage());
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    UnitConnection.prototype.removeClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self;
            var _this_1 = this;
            return __generator(this, function (_a) {
                self = this;
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending remove client command, clientId %d...', this.senderId, this.clientId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for remove client response'));
                            }, exports.screenlogic.netTimeout);
                            self.once('removeClient', function (clientAck) {
                                clearTimeout(_timeout);
                                debugUnit('received removeClient event');
                                resolve(true);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.connection.createRemoveClientMessage());
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    UnitConnection.prototype.pingServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self;
            var _this_1 = this;
            return __generator(this, function (_a) {
                self = this;
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] pinging server', this.senderId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for ping server response'));
                            }, exports.screenlogic.netTimeout);
                            self.once('pong', function (pong) {
                                clearTimeout(_timeout);
                                debugUnit('received pong event');
                                resolve(true);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.connection.createPingMessage());
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    UnitConnection.prototype.onClientMessage = function (msg) {
        debugUnit('received message of length %d', msg.length);
        // var msgType = buf.readInt16LE(2);
        console.log("got a message ".concat(msg.messageId));
        switch (msg.messageId) {
            case 15: //SLChallengeMessage.getResponseId():
                debugUnit("  it's a challenge response");
                var challengeString = ConnectionMessage_1.ConnectionMessage.decodeChallengeResponse(msg);
                // this.challengeString = new SLChallengeMessage(buf).get();
                this.login(challengeString);
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
                var equipmentState = EquipmentStateMessage_1.EquipmentStateMessage.decodeEquipmentStateResponse(msg);
                this.emit('equipmentState', equipmentState);
                break;
            case 8121: // SLVersionMessage.getResponseId():
                debugUnit("  it's version");
                var ver = ConnectionMessage_1.ConnectionMessage.decodeVersionResponse(msg);
                this.emit('version', ver);
                break;
            case 12573: // SLIntellichlorConfigMessage.getResponseId():
                debugUnit("  it's salt cell config");
                this.emit('intellichlorConfig', ChlorMessage_1.ChlorMessage.decodeIntellichlorConfig(msg));
                break;
            case 12533: // SLControllerConfigMessage.getResponseId():
                debugUnit("  it's controller configuration");
                this.emit('controllerConfig', EquipmentStateMessage_1.EquipmentStateMessage.decodeControllerConfig(msg));
                break;
            case 12505: // SLChemDataMessage.getAsyncResponseId():
            case 12593: // SLChemDataMessage.getResponseId():
                debugUnit("  it's chem data");
                this.emit('chemicalData', ChemMessage_1.ChemMessage.decodeChemDataMessage(msg));
                break;
            case 8111: // SLGetSystemTime.getResponseId():
                debugUnit("  it's system time");
                this.emit('getSystemTime', EquipmentStateMessage_1.EquipmentStateMessage.decodeSystemTime(msg));
                break;
            case 12543: // SLGetScheduleData.getResponseId():
                debugUnit("  it's schedule data");
                this.emit('getScheduleData', ScheduleMessage_1.ScheduleMessage.decodeGetScheduleMessage(msg));
                break;
            case 12581: // SLCancelDelay.getResponseId():
                debugUnit("  it's a cancel delay ack");
                this.emit('cancelDelay', EquipmentStateMessage_1.EquipmentStateMessage.decodeCancelDelay(msg));
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
                this.emit('equipmentConfiguration', EquipmentStateMessage_1.EquipmentStateMessage.decodeEquipmentConfiguration(msg));
                break;
            case 12585: // SLGetPumpStatus.getResponseId():
                debugUnit("  it's pump status");
                this.emit('getPumpStatus', PumpMessage_1.PumpMessage.decodePumpStatus(msg));
                break;
            case 9808: // SLGetWeatherForecast.getResponseId():
                debugUnit("  it's a weather forecast ack");
                this.emit('weatherForecast', EquipmentStateMessage_1.EquipmentStateMessage.decodeWeatherMessage(msg));
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
            case 12587: // SLSetPumpSpeed.getResponseId():
                debugUnit("  it's a set pump flow ack");
                this.emit('setPumpSpeed', PumpMessage_1.PumpMessage.decodeSetPumpSpeed(msg));
                break;
            // ------------  ASYNC MESSAGES --------------- //
            case 8113: // SLSetSystemTime.getResponseId():
                debugUnit("  it's a set system time ack");
                this.emit('setSystemTime', EquipmentStateMessage_1.EquipmentStateMessage.decodeSetSystemTime(msg));
                break;
            case 12535: // SLGetHistoryData.getResponseId():
                debugUnit("  it's a history data query ack");
                this.emit('getHistoryDataPending');
                break;
            case 12502: // SLGetHistoryData.getPayloadId():
                debugUnit("  it's a history data payload");
                this.emit('getHistoryData', EquipmentStateMessage_1.EquipmentStateMessage.decodeGetHistory(msg));
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
                debugUnit("  it's an unknown type: %d", msg.messageId);
                break;
        }
    };
    return UnitConnection;
}(events_1.EventEmitter));
exports.UnitConnection = UnitConnection;
exports.screenlogic = new UnitConnection();
var Equipment = /** @class */ (function () {
    function Equipment() {
    }
    Equipment.prototype.setSystemTime = function (date, shouldAdjustForDST) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            if (!(date instanceof Date)) {
                                debugUnit('setSystemTime() must receive valid Date object for the date argument');
                                reject(new Error("Date is not of type date"));
                                // this.emit('setSystemTime', null);
                                return [2 /*return*/];
                            }
                            if (typeof shouldAdjustForDST !== 'boolean') {
                                debugUnit('setSystemTime() must receive a boolean for the shouldAdjustForDST argument');
                                reject(new Error("setSystemTime() must receive a boolean for the shouldAdjustForDST argument"));
                                // this.emit('setSystemTime', null);
                                return [2 /*return*/];
                            }
                            debugUnit('[%d] sending set system time command...', exports.screenlogic.senderId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for set system time response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('setSystemTime', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received setSystemTime event');
                                resolve(data);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.equipment.createSetSystemTimeMessage(date, shouldAdjustForDST));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Equipment.prototype.getWeatherForecast = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] requesting weather forecast', exports.screenlogic.senderId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for weather forecast response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('weatherForecast', function (equipment) {
                                clearTimeout(_timeout);
                                debugUnit('received weatherForecast event');
                                resolve(equipment);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.equipment.createWeatherMessage());
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Equipment.prototype.getHistoryData = function (fromTime, toTime) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout, now, yesterday;
                        return __generator(this, function (_a) {
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for get history response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('getHistoryData', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received getHistoryData event');
                                resolve(data);
                            });
                            now = new Date();
                            yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            debugUnit('[%d] requesting history data from `%s` to `%s`', exports.screenlogic.senderId, fromTime || yesterday, toTime || now);
                            exports.screenlogic.write(exports.screenlogic.controller.equipment.createGetHistoryMessage(fromTime || yesterday, toTime || now));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Equipment.prototype.getEquipmentConfiguration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending equipment configuration query...', exports.screenlogic.senderId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for equipment configuration response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('equipmentConfiguration', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received equipmentConfiguration event');
                                resolve(data);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.equipment.createEquipmentConfigurationMessage());
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Equipment.prototype.cancelDelay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending cancel delay command...', exports.screenlogic.senderId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting to cancel delays'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('cancelDelay', function (delay) {
                                clearTimeout(_timeout);
                                debugUnit('received cancelDelay event');
                                resolve(true);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.equipment.createCancelDelayMessage());
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Equipment.prototype.getSystemTime = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending get system time query...', exports.screenlogic.senderId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for chemical config'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('getSystemTime', function (systemTime) {
                                clearTimeout(_timeout);
                                debugUnit('received getSystemTime event');
                                resolve(systemTime);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.equipment.createGetSystemTimeMessage());
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Equipment.prototype.getControllerConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending controller config query...', exports.screenlogic.senderId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for controller config'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('controllerConfig', function (controller) {
                                clearTimeout(_timeout);
                                debugUnit('received controllerConfig event');
                                resolve(controller);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.equipment.createGetControllerConfigMessage());
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Equipment.prototype.getEquipmentState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending pool status query...', exports.screenlogic.senderId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for pool status'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('equipmentState', function (equipmentState) {
                                clearTimeout(_timeout);
                                debugUnit('received equipmentState event');
                                resolve(equipmentState);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.equipment.createEquipmentStateMessage());
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    return Equipment;
}());
exports.Equipment = Equipment;
var Circuit = /** @class */ (function (_super) {
    __extends(Circuit, _super);
    function Circuit() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Circuit.prototype.sendLightCommand = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending light command: controllerId: %d, command: %d...', exports.screenlogic.senderId, this.controllerId, command);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for light command response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('sentLightCommand', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received sentLightCommand event');
                                resolve(data);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.circuits.createIntellibriteMessage(command));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Circuit.prototype.setCircuitRuntimebyId = function (circuitId, runTime) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending set circuit runtime command for circuitId: %d, runTime: %d...', exports.screenlogic.senderId, circuitId, runTime);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for set circuit run time response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('setCircuitRuntimebyId', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received setCircuitRuntimebyId event');
                                resolve(data);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.circuits.createSetCircuitRuntimeMessage(circuitId, runTime));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Circuit.prototype.setCircuitState = function (circuitId, circuitState) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending set circuit state command: controllerId: %d, circuitId: %d, circuitState: %d...', exports.screenlogic.senderId, this.controllerId, circuitId, circuitState);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for set circuit state response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('circuitStateChanged', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received circuitStateChanged event');
                                resolve(data);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.circuits.createSetCircuitMessage(circuitId, circuitState));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    return Circuit;
}(UnitConnection));
exports.Circuit = Circuit;
var Body = /** @class */ (function (_super) {
    __extends(Body, _super);
    function Body() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Body.prototype.setSetPoint = function (bodyIndex, temperature) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending set setpoint command: controllerId: %d, bodyIndex: %d, temperature: %d...', exports.screenlogic.senderId, this.controllerId, bodyIndex, temperature);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for body setpoint response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('setPointChanged', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received setPointChanged event');
                                resolve(data);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.bodies.createSetPointMessage(bodyIndex, temperature));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Body.prototype.setHeatMode = function (bodyIndex, heatMode) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending set heatmode command: controllerId: %d, bodyIndex: %d, heatMode: %d...', exports.screenlogic.senderId, this.controllerId, bodyIndex, heatMode);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for body heat mode response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('heatModeChanged', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received heatModeChanged event');
                                resolve(data);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.bodies.createHeatModeMessage(bodyIndex, heatMode));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    return Body;
}(UnitConnection));
exports.Body = Body;
var Pump = /** @class */ (function (_super) {
    __extends(Pump, _super);
    function Pump() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Pump.prototype.setPumpSpeed = function (pumpId, circuitId, speed, isRPMs) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending set pump flow command for pumpId: %d, circuitId: %d, setPoint: %d, isRPMs: %d...', exports.screenlogic.senderId, pumpId, circuitId, speed, isRPMs);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for set pump speed response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('setPumpSpeed', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received setPumpSpeed event');
                                resolve(data);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.pumps.setPumpSpeed(pumpId, circuitId, speed, isRPMs));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Pump.prototype.getPumpStatus = function (pumpId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending get pump status command for pumpId: %d...', exports.screenlogic.senderId, pumpId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for pump status response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('getPumpStatus', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received getPumpStatus event');
                                resolve(data);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.pumps.createPumpStatusMessage(pumpId));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    return Pump;
}(UnitConnection));
exports.Pump = Pump;
var Schedule = /** @class */ (function (_super) {
    __extends(Schedule, _super);
    function Schedule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Schedule.prototype.setScheduleEventById = function (scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending set schedule event command for scheduleId: %d, circuitId: %d, startTime: %d, stopTime: %d, dayMask: %d, flags: %d, heatCmd: %d, heatSetPoint: %d...', exports.screenlogic.senderId, scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for set schedule response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('setScheduleEventById', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received setScheduleEventById event');
                                resolve(data);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.schedules.createSetScheduleEventMessage(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Schedule.prototype.addNewScheduleEvent = function (scheduleType) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending add new schedule event command for scheduleType: %d...', exports.screenlogic.senderId, scheduleType);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for add new schedule response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('addNewScheduleEvent', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received addNewScheduleEvent event');
                                resolve(data);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.schedules.createAddScheduleEventMessage(scheduleType));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Schedule.prototype.deleteScheduleEventById = function (scheduleId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending delete schedule event command for scheduleId: %d...', exports.screenlogic.senderId, scheduleId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for delete schedule response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('deleteScheduleEventById', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received deleteScheduleEventById event');
                                resolve(data);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.schedules.createDeleteScheduleEventMessage(scheduleId));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Schedule.prototype.getScheduleData = function (scheduleType) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending set schedule data query for scheduleType: %d...', exports.screenlogic.senderId, scheduleType);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for schedule data'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('getScheduleData', function (schedule) {
                                clearTimeout(_timeout);
                                debugUnit('received getScheduleData event');
                                resolve(schedule);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.schedules.createGetSchedulesMessage(scheduleType));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    return Schedule;
}(UnitConnection));
exports.Schedule = Schedule;
var Chem = /** @class */ (function (_super) {
    __extends(Chem, _super);
    function Chem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Chem.prototype.getChemHistoryData = function (fromTime, toTime) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout, now, yesterday;
                        return __generator(this, function (_a) {
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for get chem history response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('getChemHistoryData', function (data) {
                                clearTimeout(_timeout);
                                debugUnit('received getChemHistoryData event');
                                resolve(data);
                            });
                            now = new Date();
                            yesterday = new Date();
                            debugUnit('[%d] requesting chem history data from `%s` to `%s`', exports.screenlogic.senderId, fromTime || yesterday, toTime || now);
                            yesterday.setHours(now.getHours() - 24);
                            exports.screenlogic.write(exports.screenlogic.controller.chem.createGetChemHistoryMessage(fromTime || yesterday, toTime || now));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Chem.prototype.getChemicalData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending chemical data query...', exports.screenlogic.senderId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for chemical config'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('chemicalData', function (chemical) {
                                clearTimeout(_timeout);
                                debugUnit('received chemicalData event');
                                resolve(chemical);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.chem.createChemStatusMessage());
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    return Chem;
}(UnitConnection));
exports.Chem = Chem;
var Chlor = /** @class */ (function (_super) {
    __extends(Chlor, _super);
    function Chlor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Chlor.prototype.setIntellichlorOutput = function (poolOutput, spaOutput) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending set intellichlor output command: controllerId: %d, poolOutput: %d, spaOutput: %d...', exports.screenlogic.senderId, this.controllerId, poolOutput, spaOutput);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for set intellichlor response'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('setIntellichlorConfig', function (equipment) {
                                clearTimeout(_timeout);
                                debugUnit('received setIntellichlorConfig event');
                                resolve(equipment);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.chlor.createSetChlorOutputMessage(poolOutput, spaOutput));
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    Chlor.prototype.getIntellichlorConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this_1, void 0, void 0, function () {
                        var _timeout;
                        return __generator(this, function (_a) {
                            debugUnit('[%d] sending salt cell config query...', exports.screenlogic.senderId);
                            _timeout = setTimeout(function () {
                                reject(new Error('time out waiting for intellichlor config'));
                            }, exports.screenlogic.netTimeout);
                            exports.screenlogic.once('intellichlorConfig', function (intellichlor) {
                                clearTimeout(_timeout);
                                debugUnit('received intellichlorConfig event');
                                resolve(intellichlor);
                            });
                            exports.screenlogic.write(exports.screenlogic.controller.chlor.createSaltCellConfigMessage());
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    return Chlor;
}(UnitConnection));
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
    PumpTypes[PumpTypes["PUMP_TYPE_INTELLIFLOVF"] = 1] = "PUMP_TYPE_INTELLIFLOVF";
    PumpTypes[PumpTypes["PUMP_TYPE_INTELLIFLOVS"] = 2] = "PUMP_TYPE_INTELLIFLOVS";
    PumpTypes[PumpTypes["PUMP_TYPE_INTELLIFLOVSF"] = 3] = "PUMP_TYPE_INTELLIFLOVSF";
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
