# node-screenlogic

This is a Node.JS module for interfacing with Pentair ScreenLogic systems over your local network or remotely through the Pentair dispatcher. Local connections require a Pentair ScreenLogic device on the same network (a network which supports UDP broadcasts).

Tested with a Pentair ScreenLogic system on firmware versions 5.2 Build 736.0 Rel, 5.2 Build 738.0 Rel

See the [Wiki](https://github.com/parnic/node-screenlogic/wiki/2.0) for information on migrating from v1 to v2.

Table of Contents:

* [Usage](#usage)
* [Notes](#notes)
* [Packet format](#packet-format)
* [API reference](#api-reference)
  * [FindUnits](#findunits)
    * [search](#search)
    * [searchAsync](#searchasyncsearchtimems)
    * [close](#close)
  * [RemoteLogin](#remotelogin)
    * [connectAsync](#connectasync)
    * [closeAsync](#closeasync)
  * [UnitConnection (screenlogic)](#unitconnection)
    * Base Methods
      * [init](#initsystemname-address-port-password-senderid)
      * [initUnit](#initunitlocalunit)
      * [connectAsync](#connectasync)
      * [closeAsync](#closeasync-1)
      * [addClientAsync](#addclientasyncclientid-senderid)
      * [getVersionAsync](#getversionasyncsenderid)
      * [pingServerAsync](#pingserverasyncsenderid)
      * [reconnectAsync](#reconnectasync)
      * [removeClientAsync](#removeclientasyncclientid)
      * [status](#status)
    * [Body](#body)
      * [setCoolSetPointAsync](#bodysetcoolsetpointasyncbodyid-temperature-senderid)
      * [setHeatModeAsync](#bodysetheatmodeasyncbodyid-heatmode-senderid)
      * [setSetPointAsync](#bodysetsetpointasyncbodyid-temperature-senderid)
    * [Chemistry](#chemistry)
      * [getChemHistoryDataAsync](#chemgetchemhistorydataasyncfromtime-totime-senderid)
      * [getChemicalDataAsync](#chemgetchemicaldataasyncsenderid)
    * [Chlorinator](#chlorinator)
      * [getIntellichlorConfigAsync](#chlorgetintellichlorconfigasyncsenderid)
      * [setIntellichlorIsActiveAsync](#chlorsetintellichlorisactiveasyncisactive-senderid)
      * [setIntellichlorOutputAsync](#chlorsetintellichloroutputasyncpooloutput-spaoutput-senderid)
    * [Circuit](#circuit)
      * [sendLightCommandAsync](#circuitsendlightcommandasynccommand-senderid)
      * [setCircuitAsync](#circuitsetcircuitasynccircuitid-nameindex-circuitfunction-circuitinterface-freeze-colorpos-senderid)
      * [setCircuitRuntimeByIdAsync](#circuitsetcircuitruntimebyidasynccircuitid-runtime-senderid)
      * [setCircuitStateAsync](#circuitsetcircuitstateasynccircuitid-circuitstate-senderid)
    * [Equipment](#equipment)
      * [cancelDelayAsync](#equipmentcanceldelayasyncsenderid)
      * [getCircuitDefinitionsAsync](#equipmentgetcircuitdefinitionsasyncsenderid)
      * [getCircuitNamesAsync](#equipmentgetcircuitnamesasyncsize-senderid)
      * [getControllerConfigAsync](#equipmentgetcontrollerconfigasyncsenderid)
      * [getCustomNamesAsync](#equipmentgetcustomnamesasyncsenderid)
      * [getEquipmentConfigurationAsync](#equipmentgetequipmentconfigurationasyncsenderid)
      * [getEquipmentStateAsync](#equipmentgetequipmentstateasyncsenderid)
      * [getHistoryDataAsync](#equipmentgethistorydataasyncfromtime-totime-senderid)
      * [getSystemTimeAsync](#equipmentgetsystemtimeasyncsenderid)
      * [getWeatherForecastAsync](#equipmentgetweatherforecastasyncsenderid)
      * [setCustomNameAsync](#equipmentsetcustomnameasyncidx-name-senderid)
      * [setEquipmentConfigurationAsync](#equipmentsetequipmentconfigurationasyncdata-senderid)
      * [setSystemTimeAsync](#equipmentsetsystemtimeasyncdate-adjustfordst-senderid)
    * [Pump](#pump)
      * [getPumpStatusAsync](#pumpgetpumpstatusasyncpumpid-senderid)  
      * [setPumpSpeedAsync](#pumpsetpumpspeedasyncpumpid-circuitid-speed-isrpms-senderid)
    * [Schedule](#schedule)
      * [addNewScheduleEventAsync](#scheduleaddnewscheduleeventasyncscheduletype-senderid)
      * [deleteScheduleEventByIdAsync](#scheduledeletescheduleeventbyidasyncscheduleid-senderid)
      * [getScheduleDataAsync](#schedulegetscheduledataasyncscheduletype-senderid)
      * [setScheduleEventByIdAsync](#schedulesetscheduleeventbyidasyncscheduleid-circuitid-starttime-stoptime-daymask-flags-heatcmd-heatsetpoint-senderid)

## Usage

See example.ts for an example of interfacing with the library. Broadly, import the library with

```javascript
import * as Screenlogic from "./index";
```

Individual named imports can also be used. Then for local connections create a new ScreenLogic unit finder with

```javascript
let finder = new ScreenLogic.FindUnits();
let localUnit = await finder.searchAsync();
return Promise.resolve(localUnit);
```

If you prefer to use an event-based approach, you can hook the `serverFound` event with:

```javascript
.on('serverFound', function(server) { })
await finder.searchAsync();
```

and call it via `searchAsync()`. This performs a UDP broadcast on 255.255.255.255, port 1444, so ensure your network supports UDP broadcasts and the device is on the same subnet.

Alternatively, to find a unit remotely, create a new ScreenLogic remote login with

```javascript
let gateway = new ScreenLogic.RemoteLogin(systemName);  // systemName in the format "Pentair: xx-xx-xx"
let unit = await gateway.connectAsync();
if (!unit || !unit.gatewayFound || unit.ipAddr === '') {
  logger.error(`Screenlogic: No unit found called ${systemName}`);
  return;
}
await gateway.closeAsync();
```

and call it via `connectAsync()`. This opens a TCP connection to screenlogicserver.pentair.com, port 500.

When a local or remote server is found, create and connect to a new UnitConnection with

```javascript
let client = ScreenLogic.screenlogic;
client.init(systemName, ipAddr, port, password);  // ipAddr and password as strings; port as integer
await client.connectAsync();
```

where `password` is the remote login password.

Once you've connected with `connectAsync()`, there are a number of methods available and corresponding events for when they've completed successfully. See [screenlogic](#unitconnection) API reference.

All communication with a ScreenLogic unit is done via TCP, so responses will come back in the order they were requested.

## Notes

Contributions welcome. There are lots of available messages supported by ScreenLogic that the app doesn't support yet, but can be added pretty easily as needed.

## Packet format

All ScreenLogic packets are sent with an 8-byte header. The first 2 bytes are a little-endian-encoded sender ID (which is normally specified when making the original request). The second 2 bytes are a little-endian-encoded message ID. The final 4 bytes are a little-endian-encoded length of the data payload on the packet. The data payload is handled per-message.

## API Reference

Pull requests to document undocumented properties are most welcome.

### FindUnits

#### constructor()

Examples:

```javascript
import * as Screenlogic from 'node-screenlogic';
/*or
const ScreenLogic = require('node-screenlogic');
*/
var finder = new ScreenLogic.FindUnits();
```

#### search()

Issues one UDP broadcast search for available units. Since this is a stateless UDP query, the connection will not automatically be closed, so you may need to issue another search if the first one doesn't work, if your network connection is not established, etc. There is no automatic timeout built in to this command. This call does not return any found units directly, but does emit the `serverFound` message which contains each LocalUnit object that is found:

* `address` - ip address string
* `type` - integer
* `port` - integer, the port to connect to
* `gatewayType` - integer
* `gatewaySubtype` - integer
* `gatewayName` - the gateway/unit name as a string

#### searchAsync(searchTimeMs?)

Issues one UDP broadcast search for available units. This is a stateless UDP query, but the connection will automatically be closed, so you may need to issue another search if the first one doesn't work, if your network connection is not established, etc. There is a 5s timeout built in to this command, and no retry mechanism.

Optionally accepts a number of milliseconds to wait for units; defaults to 5000 if not specific. Returns a LocalUnit[] array with each object containing:

* `address` - ip address string
* `type` - integer
* `port` - integer, the port to connect to
* `gatewayType` - integer
* `gatewaySubtype` - integer
* `gatewayName` - the gateway/unit name as a string

This async call will also emit the `serverFound` message.

#### close()

Closes the socket. Only needed for search(). searchAsync() will close the socket itself.

#### Events

* `close` - Indicates that `close()` has been called on the finder.
* `error` - Indicates that an unhandled error was caught (such as the connection timing out).
* `serverFound` - Indicates that a ScreenLogic unit has been found. Event handler receives a [UnitConnection](#unitconnection) object. The async call is a wrapper for this event.

Examples:

```javascript
let finder = new ScreenLogic.FindUnits();
let localUnit = await finder.searchAsync();
// or hook the event if you don't assign the function to a variable
finder.on('serverFound', function(server) {
  // server object will contain connection information
})
```

### RemoteLogin

#### constructor(systemName)

Argument is the name of a system to connect to in "Pentair: xx-xx-xx" format.

Example:

```javascript
let gateway = new ScreenLogic.RemoteLogin(systemName);  // systemName in the format "Pentair: xx-xx-xx"
let unit = await gateway.connectAsync();
if (!unit || !unit.gatewayFound || unit.ipAddr === '') {
  logger.error(`Screenlogic: No unit found called ${systemName}`);
  return;
}
await gateway.closeAsync();
// or use the emit if you don't assign the function to a variable
```

#### connectAsync()

Connects to the dispatcher service and searches for the unit passed to its constructor.

#### closeAsync()

Closes the connection and removes all listeners.

#### Events

* `close` - Indicates that the connection to the remote login server has been closed. Event handler receives a bool indicating whether there was a transmission error.
* `end` - Indicates the socket has terminated.
* `error` - Indicates that an unhandled error was caught (such as the connection timing out).
* `timeout` - Indicates the socket timed out.
* `clientError` - Indicates an error with the client on the other end of the socket.
* `gatewayFound` - Indicates that the search for the named unit has completed (may or may not be successful). Event handler receives a [SLReceiveGatewayDataMessage](#slreceivegatewaydatamessage) argument. The async function is a promise that wraps this event.

### UnitConnection

#### Module

`screenlogic` is an exported module that maintains state and connection for a given unit. Parameters are initialized with the `init` and connections are made with the `connectAsync` functions.

Examples:

```javascript
let client = ScreenLogic.screenlogic;
client.init(systemName, unit.ipAddr, unit.port, password);
await client.connectAsync();
```

#### init(systemName, address, port, password, senderId?)

Takes the parameters `(systemName, address, port, password, senderId?)`

systemName is a string. Port is an integer. Address is an IPv4 address of the server as a string. Password is optional; should be the 4-digit password in string form, e.g. `'1234'`.

`senderId` can be set once (or it defaults to 0) and will be present as the `senderId` field on the returned message.

Examples:

```javascript
client.init('Pentair: 00-00-00', '10.0.0.85', 80, '1234', senderId?);
```

#### initUnit(localUnit)

Helper method for [init](#initsystemname-address-port-password-senderid). Takes a `LocalUnit` remote login object and passes the appropriate values to `init`.

#### connectAsync()

Connects to the server after `init` parameters are set.

Examples:

```javascript
await client.connectAsync();
```

#### closeAsync()

Closes the connection and removes all listeners.

#### addClientAsync(clientId?, senderid?)

Registers to receive updates from controller when something changes. Takes a random number `clientId` (if passed, or will be randomly assigned) to identify the client. Resolves/emits the `addClient` event when the request to add a client is acknowledged. As long as this client is connected, various events will be emitted when something changes on the controller, such as `equipmentState` or `chemicalData`.

#### getVersionAsync(senderId?)

Requests the system version string from the connected unit. Resolves/emits the `version` event when the response comes back.

#### pingServerAsync(senderId?)

Sends a ping to the server to keep the connection alive. Resolves/emits the `pong` event when the response comes back.

#### reconnectAsync()

Will be automatically called if node-screenlogic detects an error in communications, but can also be called manually to re-establish communications.

#### removeClientAsync(clientId)

No longer receive update messages from controller. Resolves/emits the `removeClient` event when the request to remove a client is acknowledged. `clientId` must match a client previously registered via [addClientAsync()](#addclientasyncclientid-senderid).

#### status()

Returns an object with the socket state:

* `destroyed` - boolean indicating if the socket has been destroyed
* `connecting` - boolean indicating if the socket is in a connecting state
* `timeout` - optional boolean indicating if the socket timed out
* `readyState` - [string](https://nodejs.dev/en/api/v16/net/#socketreadystate)

### Body

#### body.setCoolSetPointAsync(bodyId, temperature, senderId?)

Sets the cooling setpoint for any body. Emits the `coolSetPointChanged` event when response is acknowledged. Resolves with [BoolData](#booldata).

Parameters:

* `bodyId` - integer indicating the type of body to set the setpoint of. The pool is body `0` and the spa is body `1`.
* `temperature` - integer indicating the desired setpoint. This is presumably in whatever units your system is set to (celsius or fahrenheit).

#### body.setHeatModeAsync(bodyId, heatMode, senderId?)

Sets the preferred heat mode. See [SLSetHeatModeMessage](#slsetheatmodemessage) documentation for argument values. Emits the `heatModeChanged` event when response is acknowledged. Resolves with [BoolData](#booldata).

#### body.setSetPointAsync(bodyId, temperature, senderId?)

Sets the heating setpoint for any body. Emits the `setPointChanged` event when response is acknowledged. Resolves with [BoolData](#booldata).

Parameters:

* `bodyId` - integer indicating the type of body to set the setpoint of. The pool is body `0` and the spa is body `1`.
* `temperature` - integer indicating the desired setpoint. This is presumably in whatever units your system is set to (celsius or fahrenheit).

### Chemistry

#### chem.getChemHistoryDataAsync(fromTime?, toTime?, senderId?)

Requests chemical history data from the connected unit. This is information about the pH and ORP readings over time and when pH and ORP feeds were turned on and off. `fromTime` is the time (as a Javascript Date object) that you want to get events from and `toTime` is the time (as a Javascript Date object) that you want to get events until. If omitted, data will be resolved for the past 24 hours. Emits the `getChemHistoryDataPending` event when the request to get data is confirmed, then the `getChemHistoryData` event when the chemical history data is actually ready to be handled. Resolves with [SLChemHistory](#slgetchemhistorydata).

#### chem.getChemicalDataAsync(senderId?)

Requests chemical data from the connected unit (may require an IntelliChem or similar). Emits the `chemicalData` event when the response comes back. Resolves with [SLChemData](#slchemdata).

### Chlorinator

#### chlor.getIntellichlorConfigAsync(senderId?)

Requests salt cell status/configuration from the connected unit (requires an IntelliChlor or compatible salt cell). Emits the `intellichlorConfig` event when the response comes back. Resolves with [SLIntellichlorData](#slintellichlordata).

#### chlor.setIntellichlorIsActiveAsync(isActive, senderId?)

Tells the OCP if a chlorinator is present. `isActive` is a boolean. Emits the `intellichlorIsActive` event. Resolves with [BoolData](#booldata).

#### chlor.setIntellichlorOutputAsync(poolOutput, spaOutput, senderId?)

Sets the salt cell's output levels. See [SLSetIntellichlorConfigMessage](#slsetintellichlorconfigmessage) documentation for argument values. Emits the `setIntellichlorConfig` event when response is acknowledged. Resolves with [BoolData](#booldata).

### Circuit

#### circuit.sendLightCommandAsync(command, senderId?)

Sends a lighting command. See [SLLightControlMessage](#sllightcontrolmessage) documentation for argument values. Emits the `sentLightCommand` event when response is acknowledged. Resolves with [BoolData](#booldata).

EasyTouch/Intellitouch only have a single light group and individual lights cannot be address. Pentair's Intellicenter offers this capability.

#### circuit.setCircuitAsync(circuitId, nameIndex, circuitFunction, circuitInterface, freeze, colorPos, senderId?)

Parameters:

* `circuitId` - 1 based index of circuit id's
* `nameIndex` - 1 based index of the name id (built-in or custom)
* `circuitFunction` - Number from [getCircuitDefinitionsAsync](#equipmentgetcircuitdefinitionsasyncsenderid)
* `circuitInterface` -  0 = pool; 1 = spa; 2 = features; 4 = lights; 5 = hide
* `freeze` - boolean. Turn this circuit on with freeze protection.
* `colorPos` - Number. Only applicable for Intellibrite.

Sets the configuration for a specific circuit. Emits the `circuit` event when completed. Resolves with [BoolData](#booldata).

#### circuit.setCircuitRuntimebyIdAsync(circuitId, runTime, senderId?)

Configures default run-time of a circuit, usually referred to as the 'egg timer'. This also applies to 'run-once' programs as this will set the length of the program. See [SLSetCircuitRuntimeById](#slsetcircuitruntimebyid) documentation for argument values. Emits the `setCircuitRuntimeById` event when response is acknowledged. Resolves with [BoolData](#booldata).

#### circuit.setCircuitStateAsync(circuitId, circuitState, senderId?)

Activates or deactivates a circuit. See [SLSetCircuitStateMessage](#slsetcircuitstatemessage) documentation for argument values. Emits the `circuitStateChanged` event when response is acknowledged. Resolves with [BoolData](#booldata).

### Equipment

#### equipment.cancelDelayAsync(senderId?)

Cancels any delays on the system. Resolves as a [BoolData](#booldata) and emits the `cancelDelay` event when response is acknowledged.

#### equipment.getCircuitDefinitionsAsync(senderId?)

Returns an array of objects that represent the different circuit functions that a circuit can be assigned. Emits the `circuitDefinitions` event which resolves to a [SLCircuitNamesData](#slcircuitnamesdata) object.

#### equipment.getCircuitNamesAsync(size?, senderId?)

Returns an array of objects with circuit names and IDs. Internally, this calls equipment.getNCircuitNames() for the count of circuits and equipment.getCircuitNames(index, count) to retrieve the array from the server. Emits the `circuitNames` event which resolves with a [SLCircuitNamesData](#slcircuitnamesdata) object.

#### equipment.getControllerConfigAsync(senderId?)

Requests controller configuration from the connected unit. Emits the `controllerConfig` event when the response comes back. Resolves with [EquipmentConfigurationMessage](#equipmentconfigurationmessage).

#### equipment.getCustomNamesAsync(senderId?)

Requests all custom names from the OCP. An array of 20 names will be returned, but some OCP's only support 10. Emits the `getCustomNames` event. Resolves with [SLGetCustomNamesData](#slgetcustomnamesdata).

#### equipment.getEquipmentConfigurationAsync(senderId?)

Resolves/emits the `equipmentConfiguration` event when the response comes back. This is the basic configuration of what equipment is installed on the controller. Resolves with [SLEquipmentConfigurationData](#slequipmentconfigurationdata).

#### equipment.getEquipmentStateAsync(senderid?)

Emits the `equipmentState` event when the response comes back. This is the current state of all equipment in the system. Resolves with [SLEquipmentStateMessage](#slequipmentstatemessage).

#### equipment.getHistoryDataAsync(fromTime?, toTime?, senderId?)

Requests history data from the connected unit. This is information like what various temperature sensors (air, water) read over time, changes in heat setpoints, and when various circuits (pool, spa, solar, heater, and lights) were turned on and off. `fromTime` is the time (as a Javascript Date object) that you want to get events from and `toTime` is the time (as a Javascript Date object) that you want to get events until. Will default to the last 24 hours if fromTime/toTime are not provided. Resolves/emits the `getHistoryDataPending` event when the request to get data is confirmed, then the `getHistoryData` event when the history data is actually ready to be handled. Resolves with [SLHistoryData](#slhistorydata).

#### equipment.getSystemTimeAsync(senderid?)

Retrieves the current time the system is set to. Emits the `getSystemTime` event when response is received. Resolves with [SLSystemTimeData](#slsystemtimedata).

#### equipment.getWeatherForecastAsync(senderId?)

Requests the system version string from the connected unit. Emits the `weatherForecast` event when the response comes back. Resolves with [SLWeatherForecastData](#slweatherforecastdata).

#### equipment.setCustomNameAsync(idx, name, senderId?)

Sets an individual custom name on the OCP. `idx` is the index of the custom name, `name` is the custom name to be set, `senderId` is the optional unique identifier. Emits the `setCustomName` event. Resolves with [BoolData](#booldata).

#### equipment.setEquipmentConfigurationAsync(data, senderId?)

This method allows you to set the configuration of the controller. `data` is in the format of `SLEquipmentConfigurationData` but will take any individual component, or all components. Emits the `setEquipmentConfiguration` event which resolves with [SLSetEquipmentConfigurationData](#slsetequipmentconfigurationdata).

#### equipment.setSystemTimeAsync(date, adjustForDST, senderid?)

Sets the current date and time of the ScreenLogic system. Resolves/emits the `setSystemTime` event when request is acknowledged. `date` must be a `Date` instance holding the date/time to set, and `adjustForDST` must be a boolean indicating whether the system should adjust for daylight saving time or not. Resolves with [SLSystemTimeData](#slsystemtimedata).

### Pump

#### pump.getPumpStatusAsync(pumpId, senderId?)

Gets information about the specified pump (1 based index). See [SLPumpStatusData](#slpumpstatusdata) documentation for argument values. Resolves/emits the `getPumpStatus` event when response is acknowledged.

#### pump.setPumpSpeedAsync(pumpId, circuitId, speed, isRPMs?, senderId?)

Parameters:

* `pumpId` - id of pump to get information about, first pump is 0
* `circuitId` - index of circuit for which to change the set point (id of the pump as returned by [SLPumpStatusData](#slpumpstatusdata))
* `speed` - the value for which to set the pump/circuit combo
* `isRPMs` - optional (will be inferred). boolean, `true` for RPMs, `false` for GPMs

Sets speed (rpm) or flow (gpm) setting for a pump/circuit combination. Emits the `setPumpSpeed` event when response is acknowledged. Resolves with [BoolData](#booldata).

### Schedule

#### schedule.addNewScheduleEventAsync(scheduleType, senderId?)

Parameters:

* `scheduleType` - 0 indicates recurring scheduled events, 1 indicates a run-once event

Adds a new event to the specified schedule type. Emits either the `addNewScheduleEvent`, with [NumberData](#numberdata), or `scheduleChanged` event when response is acknowledged (listen for both).

#### schedule.deleteScheduleEventByIdAsync(scheduleId, senderId?)

Parameters:

* `scheduleType` - 0 indicates recurring scheduled events, 1 indicates a run-once event

Deletes a scheduled event with specified id. Resolves/emits the `deleteScheduleEventById`, with [BoolData](#booldata), or `scheduleChanged` event when response is acknowledged (listen for both).

#### schedule.getScheduleDataAsync(scheduleType, senderId?)

Parameters:

* `scheduleType` - 0 indicates recurring scheduled events, 1 indicates a run-once event

Retrieves a list of schedule events of the specified type. Emits the `getScheduleData` event when response is acknowledged. Resolves with an [SLScheduleData](#slscheduledata) array.

#### schedule.setScheduleEventByIdAsync(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint, senderId?)

Configures a schedule event. See [SLSetScheduleEventById](#slsetscheduleeventbyid) documentation for argument values. Resolves/emits the `setScheduleEventById` or `scheduleChanged` event when response is acknowledged (listen for both). Resolves with [BoolData](#booldata).

### Events

* `addClient` - Indicates that a response to `addClientAsync()` has been received. Event handler receives a [SLAddClient](#sladdclient) object.
* `addNewScheduleEvent` - Indicates that a response to `addNewScheduleEventAsync()` has been received which contains the created `scheduleId` to be used later for setting up the properties. Event handler receives a [NumberData](#numberdata) object.
* `badParameter` - Indicates that a bad parameter has been supplied to a function. This can be triggered, for example, by sending the wrong controller ID to a `set` function.
* `cancelDelay` - Indicates that a response to `cancelDelayAsync()` has been received. Event handler receives a [BoolData](#booldata).
* `chemicalData` - Indicates that a response to `getChemicalDataAsync()` has been received. Event handler receives a [SLChemData](#slchemdata) object.
* `circuitStateChanged` - Indicates that a response to `setCircuitStateAsync()` has been received. Event handler receives a [SLSetCircuitStateMessage](#slsetcircuitstatemessage) object.
* `close` - Indicates that the connection to the unit has been closed. Event handler receives a bool indicating whether there was a transmission error.
* `controllerConfig` - Indicates that a response to `getControllerConfigAsync()` has been received. Event handler receives a [EquipmentConfigurationMessage](#equipmentconfigurationmessage) object.
* `coolSetPointChanged` - Indicates that a response to `setCoolSetPointAsync()` has been received. Event handler receives a [BoolData](#booldata) object.
* `deleteScheduleById` - Indicates that a response to `deleteScheduleByIdAsync()` has been received. Event handler receives a [SLDeleteScheduleEventById](#sldeletescheduleeventbyid) object.
* `error` - Indicates that an unhandled error was caught (such as the connection timing out)
* `equipmentConfiguration` - Indicates a response to `getEquipmentConfigurationAsync()`. Receives a [SLEquipmentConfigurationData](#slequipmentconfigurationdata) object.
* `equipmentState` - Indicates that a response to `getEquipmentStateAsync()` has been received. Event handler receives a [SLEquipmentStateMessage](#slequipmentstatemessage) object.
* `getChemHistoryData` - Indicates that chemical history data for the requested timeframe is ready. Event handler receives a [SLGetChemHistoryData](#slgetchemhistorydata) object.
* `getChemHistoryDataPending` - Indicates that the `getChemHistoryDataAsync()` request has been received and is being processed.
* `getHistoryData` - Indicates that history data for the requested timeframe is ready. Event handler receives a [SLHistoryData](#slhistorydata) object.
* `getHistoryDataPending` - Indicates that the `getHistoryDataAsync()` request has been received and is being processed.
* `getPumpStatus` - Indicates that a response to `getPumpStatusAsync()` has been received. Event handler receives a [SLPumpStatusData](#slpumpstatusdata) object.
* `getScheduleData` - Indicates that a response to `getScheduleDataAsync()` has been received. Event handler receives a [SLGetScheduleData](#slscheduledata) object.
* `getSystemTime` - Indicates that a response to `getSystemTimeAsync()` has been received. Event handler receives a [SLSystemTimeData](#slsystemtimedata) object.
* `heatModeChanged` - Indicates that a response to `setHeatModeAsync()` has been received. Event handler receives a [SLSetHeatModeMessage](#slsetheatmodemessage) object.
* `intellichlorConfig` - Indicates that a response to `getIntellichlorConfigAsync()` has been received. Event handler receives a [SLIntellichlorConfigMessage](#slintellichlordata) object.
* `loggedIn` - Indicates that a connection to the server has been established and the login process completed. `get` methods can be called once this event has been emitted.
* `loginFailed` - Indicates that a remote login attempt via supplying a system address and password to `UnitConnection` has failed likely due to the incorrect password being used.
* `pong` - Indicates that a response to `pingServerAsync()` has been received. Event handler receives a [SLPingServerMessage](#slpingservermessage) object.
* `removeClient` - Indicates that a response to `removeClientAsync()` has been received. Event handler receives a [SLRemoveClient](#slremoveclient) object.
* `scheduleChanged` - Indicates that a response to adding, deleting, or setting a schedule has been received. Event handler receives nothing. This seems to be arbitrarily returned sometimes instead of a normal ack by the system.
* `sentLightCommand` - Indicates that a response to `sendLightCommandAsync()` has been received. Event handler receives a [SLLightControlMessage](#sllightcontrolmessage) object.
* `setCircuitRuntimeById` - Indicates that a response to `setCircuitRuntimeByIdAsync()` has been received. Event handler receives a [SLSetCircuitRuntimeById](#slsetcircuitruntimebyid) object.
* `setEquipmentConfiguration` - Indicates that the last call to `setEquipmentConfigurationAsync()` has been applied. Event handler receives a [SLSetEquipmentConfigurationData](#slsetequipmentconfigurationdata) object.
* `setEquipmentConfigurationAck` - Indicates that the request to `setEquipmentConfigurationAsync()` has been received. Event handler receives a [BoolData](#booldata) object.
* `setIntellichlorConfig` - Indicates that a response to `setIntellichlorOutputAsync()` has been received. Event handler receives a [SLSetIntellichlorConfigMessage](#slsetintellichlorconfigmessage) object.
* `setPumpSpeed` - Indicates that a response to `setPumpFlowAsync()` has been received. Event handler receives a [BoolData](#booldata) object.
* `setPointChanged` - Indicates that a response to `setSetPointAsync()` has been received. Event handler receives a [SLSetHeatSetPointMessage](#slsetheatsetpointmessage) object.
* `setScheduleEventById` - Indicates that a response to `setScheduleEventByIdAsync()` has been received. Event handler receives a [SLSetScheduleEventById](#slsetscheduleeventbyid) object.
* `setSystemTime` - Indicates that a response to `setSystemTimeAsync()` has been received. Event handler receives a [BoolData](#booldata) object if the request was valid, or `null`/rejected promise if the request was invalid (input parameters were not of the required types).
* `unknownCommand` - Indicates that an unknown command was issued to ScreenLogic (should not be possible to trigger when using the supplied `UnitConnection` methods).
* `version` - Indicates that a response to `getVersionAsync()` has been received. Event handler receives a [SLVersionMessage](#slversionmessage) object.

#### Properties

* `address` - string representing the IPv4 address of the found server
* `type` - integer representing the type of server found (will always be 2)
* `port` - short representing the port to use for TCP connections to this server
* `gatewayType` - byte
* `gatewaySubtype` - byte
* `gatewayName` - string representing the server's name. Will be in the format Pentair: xx-xx-xx

### All messages

Information about features common to all the below SL Message types.

#### decodeTime(time)

Interprets a time integer recorded as minutes past midnight and returns the ScreenLogic string representation of it in 24-hour time.

#### encodeTime(time)

Interprets the string representing 24-hour time and returns an integer of minutes past midnight.

#### decodeDayMask(mask)

Converts a day mask from, for example, `SLGetScheduleData`'s events[idx].days property into a `DAY_VALUES` array for ease of use.

#### encodeDayMask(days)

Converts an array of `DAY_VALUES` keys (`['Mon', 'Tue']`, etc.) into a mask used by, for example, `SLGetScheduleData`'s events[idx].days property.

#### getDayValue(dayName)

Returns the value of a given `DAY_VALUES` day name.

`DAY_VALUES` is defined as the following map for simplicity of checking whether a specific day is set in a mask:

```javascript
const DAY_VALUES = {
  Mon: 0x1,
  Tue: 0x2,
  Wed: 0x4,
  Thu: 0x8,
  Fri: 0x10,
  Sat: 0x20,
  Sun: 0x40,
};
```

#### Properties

* `senderId` - an integer matching whatever was passed as the `senderId` argument when making the initial request (default 0)
* `action` - an integer indicating the ScreenLogic ID for this message

### BoolData

Generic response type that holds the sender id of the request and a boolean value.

#### Properties

* `senderId` - the sender id from the matching request
* `val` - boolean value

### NumberData

Generic response type that holds the sender id of the request and a number value.

#### Properties

* `senderId` - the sender id from the matching request
* `val` - number value

### SLAddClient

Passed as an argument to the emitted `addClient` event.

### SLCancelDelay

Passed as an argument to the emitted `cancelDelay` event.

### SLChemData

Passed as an argument to the emitted `chemicalData` event handler.

#### Properties

* `isValid` - boolean indicating whether we got a valid response back or not
* `pH` - float indicating the current pH level
* `orp` - short indicating the current ORP level
* `pHSetPoint` - float indicating the desired pH level
* `orpSetPoint` - short indicating the desired ORP level
* `pHTankLevel` - byte indicating how full the pH tank is. I believe this operates on a 0-6 scale
* `orpTankLevel` - byte indicating how full the ORP tank is
* `saturation` - float indicating water balance/LSI saturation
* `calcium` - short indicating the calcium level (manually set)
* `cyanuricAcid` - short indicating the CYA level (manually set)
* `alkalinity` - short indicating the alkalinity level (manually set)
* `saltPPM` - integer representing the salt level in parts-per-million
* `temperature` - byte indicating the current water temperature
* `corrosive` - boolean indicating whether the water balance is corrosive or not
* `scaling` - boolean indicating whether the water balance is scaling or not
* `error` - boolean indicating whether there's currently an error in the chem system or not
* `balance` - bitmask containing the composite data that is broken out to `corrosive`, `scaling`, and `error` - generally you should prefer to use those properties instead

### SLCircuitNamesData

#### Properties

* `circuits` - an array of circuit ids to names
  * `id` - number indicating the id of the circuit
  * `circuitName` - string indicating the circuit's name

### EquipmentConfigurationMessage

Passed as an argument to the emitted `controllerConfig` event handler.

#### static isEasyTouch(controllerType)

Returns a bool indicating whether the system is an EasyTouch system or not. (Helper method for interpreting the value in `controllerType`.)

#### static isIntelliTouch(controllerType)

Returns a bool indicating whether the system is an IntelliTouch system or not. (Helper method for interpreting the value in `controllerType`.)

#### static isEasyTouchLite(controllerType)

Returns a bool indicating whether the system is an EasyTouch Lite system or not. (Helper method for interpreting the value in `controllerType` and `hwType`.)

#### static isDualBody(controllerType)

Returns a bool indicating whether the system is dual-body or not. (Helper method for interpreting the value in `controllerType`.)

#### static isChem2(controllerType)

Returns a bool indicating whether the system is a Chem2 system or not. (Helper method for interpreting the value in `controllerType` and `hwType`.)

#### Properties

* `controllerId` - integer indicating the id of the controller
* `minSetPoint` - array (size 2) indicating the minimum setpoint available for the pool (index 0) or spa (index 1)
* `maxSetPoint` - array (size 2) indicating the maximum setpoint available for the pool (index 0) or spa (index 1)
* `degC` - boolean indicating whether the system is using the centigrade scale for temperatures or not
* `controllerType` - byte that can be passed to static methods to interpret what type of controller this is
* `circuitCount` - integer indicating the size of the circuitArray
* `circuitArray` - array holding circuit data
  * `circuitId` - number
  * `name` - string
  * `nameIndex` - number
  * `function` - number
  * `interface` - number
  * `freeze` - number
  * `colorSet` - number
  * `colorPos` - number
  * `colorStagger` - number
  * `deviceId` - number
  * `eggTimer` - number
* `hwType` - byte passed to static methods to determine more info about the hardware
* `controllerData` - byte
* `equipment` - object containing booleans that provide additional data about available equipment
  * `POOL_SOLARPRESENT` - boolean indicating if solar is present
  * `POOL_SOLARHEATPUMP` - boolean indicating if a solar heat pump is present
  * `POOL_CHLORPRESENT` - boolean indicating if a chlorinator is present
  * `POOL_IBRITEPRESENT` - boolean indicating if IntelliBrite is present
  * `POOL_IFLOWPRESENT0` - boolean indicating if IntelliFlow pumps are present
  * `POOL_IFLOWPRESENT1` - boolean indicating if IntelliFlow pumps are present
  * `POOL_IFLOWPRESENT2` - boolean indicating if IntelliFlow pumps are present
  * `POOL_IFLOWPRESENT3` - boolean indicating if IntelliFlow pumps are present
  * `POOL_IFLOWPRESENT4` - boolean indicating if IntelliFlow pumps are present
  * `POOL_IFLOWPRESENT5` - boolean indicating if IntelliFlow pumps are present
  * `POOL_IFLOWPRESENT6` - boolean indicating if IntelliFlow pumps are present
  * `POOL_IFLOWPRESENT7` - boolean indicating if IntelliFlow pumps are present
  * `POOL_NO_SPECIAL_LIGHTS` - boolean indicating if there are no special lights present
  * `POOL_HEATPUMPHASCOOL` - boolean indicating if the heat pump has a cooling feature
  * `POOL_MAGICSTREAMPRESENT` - boolean indicating if MagicStream deck jets are present
  * `POOL_ICHEMPRESENT` - boolean indicating if an IntelliChem is present
* `genCircuitName` - string indicating the circuit name
* `interfaceTabFlags` - integer
* `colorCount` - integer indicating the size of the colorArray array
* `colorArray` - array holding light color information
  * `name` - string indicating the light name
  * `color` - object containing color data
    * `r` - byte indicating red value from 0-255
    * `g` - byte indicating green value from 0-255
    * `b` - byte indicating blue value from 0-255
* `pumpCircCount` - integer indicating the size of the pumpCircArray array
* `pumpCircArray` - array of numbers indicating ids of pump circuits
* `showAlarms` - integer

### SLDeleteScheduleEventById

Passed as an argument to the emitted `deleteScheduleEventById` event. Deletes a scheduled event with specified id.

### SLEquipmentConfigurationData

This is largely undocumented at this time, but we are making progress toward figuring it out.

* `controllerType` - byte that can be passed to EquipmentConfigurationMessage static methods to interpret what type of controller this is
* `hwType` - byte passed to EquipmentConfigurationMessage static methods to determine more info about the hardware
* `expansionsCount` - number
* `version` - number
* `pumps` - Pump[]
  * `id` - number
  * `type` - number
  * `pentairType` - PumpTypes
  * `name` - string
  * `address` - number
  * `circuits` - PumpCircuit[]
  * `primingSpeed` - number
  * `primingTime` - number
  * `minSpeed` - number
  * `maxSpeed` - number
  * `speedStepSize` - number
  * `backgroundCircuit` - number
  * `filterSize` - number
  * `turnovers` - number
  * `manualFilterGPM` - number
  * `minFlow` - number
  * `maxFlow` - number
  * `flowStepSize` - number
  * `maxSystemTime` - number
  * `maxPressureIncrease` - number
  * `backwashFlow` - number
  * `backwashTime` - number
  * `rinseTime` - number
  * `vacuumFlow` - number
  * `vacuumTime` - number
* `heaterConfig` - HeaterConfig
  * `body1SolarPresent` - boolean
  * `body2SolarPresent` - boolean
  * `thermaFloCoolPresent` - boolean
  * `solarHeatPumpPresent` - boolean
  * `thermaFloPresent` - boolean
  * `units` - number
* `valves` - Valves[]
  * `loadCenterIndex` - number
  * `valveIndex` - number
  * `valveName` - string
  * `loadCenterName` - string
  * `deviceId` - number
  * `sCircuit` -  string
* `delays` - Delays
  * `poolPumpOnDuringHeaterCooldown` - boolean
  * `spaPumpOnDuringHeaterCooldown` - boolean
  * `pumpOffDuringValveAction` - boolean
* `misc` - Misc
  * `intelliChem` - boolean
  * `manualHeat` - boolean
* `remotes` - SLRemoteData
  * `fourButton` - number[]
  * `tenButton` - number[][]
  * `quickTouch` - number[]
* `highSpeedCircuits` - number[]
* `lights` - Lights
  * `allOnAllOff` - number[]
* `spaFlow` - SpaFlow
  * `isActive` - boolean
  * `pumpId` - number
  * `stepSize` - number
* `numPumps` - number
* `rawData` - rawData
  * `versionData` - number[]
  * `highSpeedCircuitData` - number[]
  * `valveData` - number[]
  * `remoteData` - number[]
  * `heaterConfigData` - number[]
  * `delayData` - number[]
  * `macroData` - number[]
  * `miscData` - number[]
  * `lightData` - number[]
  * `pumpData` - number[]
  * `sgData` - number[]
  * `spaFlowData` - number[]

### SLGetChemHistoryData

Passed as an argument to the emitted `getChemHistoryData` event. Contains information about the remote unit's pH and ORP readings over time as well as pH and ORP feed on/off times.

#### Properties

* `phPoints` - array of objects containing the pH reading over time. Each object contains a `time` key containing a Javascript Date object, and a `pH` key containing the pH reading as a float.
* `orpPoints` - array of objects containing the ORP reading over time. Each object contains a `time` key containing a Javascript Date object, and an `orp` key containing the ORP reading as an integer.
* `phRuns` - array of objects containing the pH feed on/off times. Each object contains an `on` key containing a Javascript Date object for when the feed turned on, and an `off` key containing a Javascript Date object for when the feed turned off.
* `orpRuns` - array of objects containing the ORP feed on/off times. Each object contains an `on` key containing a Javascript Date object for when the feed turned on, and an `off` key containing a Javascript Date object for when the feed turned off.

### SLGetCustomNamesData

Passed as an argument to the emitted `setCustomNames` event.

#### Properties

* `names` - array of strings containing all custom names

### SLReceiveGatewayDataMessage

Passed as an argument to the emitted `gatewayFound` event. Contains information about the remote unit's status and access properties.

#### Properties

Note: these properties are available on the object acquired by calling `.get()` on the given message.

* `gatewayFound` - boolean indicating whether a unit was found
* `licenseOK` - boolean indicating if the license is valid (I've never seen this be false)
* `ipAddr` - string containing the ipv4 address to remotely connect to this unit
* `port` - number containing the port to connect to the unit
* `portOpen` - boolean indicating whether or not the port is open and able to be connected to
* `relayOn` - boolean indicating whether the relay is on (unsure what exactly this indicates; it's always been false in my tests)

### SLHistoryData

Passed as an argument to the emitted `getHistoryData` event. Contains information about the remote unit's temperature and circuit on/off times over time.

#### Properties

* `airTemps` - array of objects containing the air temperature over time. Each object contains a `time` key containing a Javascript Date object, and a `temp` key containing the temperature as an integer.
* `poolTemps` - array of objects containing the pool temperature over time. Each object contains a `time` key containing a Javascript Date object, and a `temp` key containing the temperature as an integer.
* `poolSetPointTemps` - array of objects containing the pool setpoint over time. Each object contains a `time` key containing a Javascript Date object, and a `temp` key containing the temperature as an integer.
* `spaTemps` - array of objects containing the spa temperature over time. Each object contains a `time` key containing a Javascript Date object, and a `temp` key containing the temperature as an integer.
* `spaSetPointTemps` - array of objects containing the spa setpoint over time. Each object contains a `time` key containing a Javascript Date object, and a `temp` key containing the temperature as an integer.
* `poolRuns` - array of objects containing the pool on/off times over time. Each object contains an `on` key containing a Javascript Date object for when the circuit turned on, and an `off` key containing a Javascript Date object for when the circuit turned off.
* `spaRuns` - array of objects containing the spa on/off times over time. Each object contains an `on` key containing a Javascript Date object for when the circuit turned on, and an `off` key containing a Javascript Date object for when the circuit turned off.
* `solarRuns` - array of objects containing the solar on/off times over time. Each object contains an `on` key containing a Javascript Date object for when the circuit turned on, and an `off` key containing a Javascript Date object for when the circuit turned off.
* `heaterRuns` - array of objects containing the heater on/off times over time. Each object contains an `on` key containing a Javascript Date object for when the circuit turned on, and an `off` key containing a Javascript Date object for when the circuit turned off.
* `lightRuns` - array of objects containing the light on/off times over time. Each object contains an `on` key containing a Javascript Date object for when the circuit turned on, and an `off` key containing a Javascript Date object for when the circuit turned off.

### SLPumpStatusData

Passed as an argument to the emitted `getPumpStatus` event. Gets information about the specified pump.

#### Properties

* `pumpId` - id of pump to get information about, first pump is 1

#### Return Values

* `isRunning` - boolean that says if pump is running
* `pumpType` - 0 if not installed or one of the IntelliFlo constants:
  * PumpTypes.PUMP_TYPE_INTELLIFLOVF
  * PumpTypes.PUMP_TYPE_INTELLIFLOVS
  * PumpTypes.PUMP_TYPE_INTELLIFLOVSF
* `pumpWatts` - current Watts usage of the pump
* `pumpRPMs` - current RPMs of the pump
* `pumpGPMs` - current GPMs of the pump
* `pumpCircuits` - Array of 8 items each containing
  * `circuitId` - Circuit Id (CircuitId matched data returned by [EquipmentConfigurationMessage](#equipmentconfigurationmessage)'s `getCircuitByDeviceIdAsync()`)
  * `speed` - the set point for this pump/circuit combo (in either RPMs or GPMs depending on the value of `isRPMs`)
  * `isRPMs` - boolean indicating if the set point is in RPMs (false means it's in GPMs)
* `pumpUnknown1` - unknown data; always 0
* `pumpUnknown2` - unknown data; always 255

### SLScheduleData

Passed as an argument to the emitted `getScheduleData` event. Retrieves a list of schedule events of the specified type, either 0 for regular events or 1 for one-time events.

#### Properties

* `data` - array of schedule datum
  * `scheduleId` - the associated scheduleId
  * `circuitId` - the circuit this schedule affects
  * `startTime` - the start time of the event, specified as a string in 24-hour time, so, for example, 6:00AM would be '0600' (see [conversion functions](#decodetimetime))
  * `stopTime` - the stop time of the event, specified as a string in 24-hour time, so, for example, 6:00AM would be '0600' (see [conversion functions](#decodetimetime))
  * `dayMask` - 7-bit mask that determines which days the schedule is active for, MSB is always 0, valid numbers 1-127 (see [conversion functions](#decodedaymaskmask))
  * `flags`
    * bit 0 is the schedule type, if 0 then regular event, if 1 its a run-once
    * bit 1 indicates whether heat setPoint should be changed
  * `heatCmd` - integer indicating the desired heater mode. Valid values are:
    * HeatModes.HEAT_MODE_OFF
    * HeatModes.HEAT_MODE_SOLAR
    * HeatModes.HEAT_MODE_SOLARPREFERRED
    * HeatModes.HEAT_MODE_HEATPUMP
    * HeatModes.HEAT_MODE_DONTCHANGE
  * `heatSetPoint` - the temperature set point if heat is to be changed (ignored if bit 1 of flags is 0)
  * `days` - which days this schedule is active for; this is just the `dayMask` property run through [decodeDayMask)`](#decodedaymaskmask) for convenience

### SLSetEquipmentConfigurationData

#### Properties

* `pumps` - Pump[]
  * `id` - number
  * `type` - number
  * `pentairType` - PumpTypes
  * `name` - string
  * `address` - number
  * `circuits` - PumpCircuit[]
  * `primingSpeed` - number
  * `primingTime` - number
  * `minSpeed` - number
  * `maxSpeed` - number
  * `speedStepSize` - number
  * `backgroundCircuit` - number
  * `filterSize` - number
  * `turnovers` - number
  * `manualFilterGPM` - number
  * `minFlow` - number
  * `maxFlow` - number
  * `flowStepSize` - number
  * `maxSystemTime` - number
  * `maxPressureIncrease` - number
  * `backwashFlow` - number
  * `backwashTime` - number
  * `rinseTime` - number
  * `vacuumFlow` - number
  * `vacuumTime` - number
* `heaterConfig` - HeaterConfig
  * `body1SolarPresent` - boolean
  * `body2SolarPresent` - boolean
  * `thermaFloCoolPresent` - boolean
  * `solarHeatPumpPresent` - boolean
  * `thermaFloPresent` - boolean
  * `units` - number
* `valves` - Valves[]
  * `loadCenterIndex` - number
  * `valveIndex` - number
  * `valveName` - string
  * `loadCenterName` - string
  * `deviceId` - number
  * `sCircuit` -  string
* `delays` - Delays
  * `poolPumpOnDuringHeaterCooldown` - boolean
  * `spaPumpOnDuringHeaterCooldown` - boolean
  * `pumpOffDuringValveAction` - boolean
* `misc` - Misc
  * `intelliChem` - boolean
  * `manualHeat` - boolean
* `remotes` - SLRemoteData
  * `fourButton` - number[]
  * `tenButton` - number[][]
  * `quickTouch` - number[]
* `highSpeedCircuits` - number[]
* `lights` - Lights
  * `allOnAllOff` - number[]
* `numPumps` - number

### SLSystemTimeData

Contains information about the system's current time and date. Passed as a return object/
an argument to the emitted `getSystemTimeAsync` event.

#### Properties

* `date` - `Date` instance representing the current system datetime (preferred, the other properties are derived from this one and provided for backward compatibility purposes)
* `year` - short representing current system year
* `month` - short representing current system month (where 1 is January, 2 is February, etc.)
* `dayOfWeek` - short representing current system day of the week (where 1 is Sunday and 7 is Saturday)
* `day` - short representing current system day of the month
* `hour` - short representing current system hour (24-hour time where 0 is midnight, 13 is 1PM, etc.)
* `minute` - short representing current system minute
* `second` - short representing current system second
* `millisecond` - short representing current system millisecond
* `adjustForDST` - bool indicating whether the system should adjust for daylight saving time or not

### SLLightControlMessage

Passed as an argument to `sentLightCommandAsync`.

#### Properties

* `controllerId` - integer indicating the ID of the controller to send this command to.
  * Note that while `SLControllerConfig` includes a controllerId, this ID, in my experience, should always be 0.
* `command` - integer indicating which command to send to the lights. Valid values are:
  * LightCommands.LIGHT_CMD_LIGHTS_OFF
  * LightCommands.LIGHT_CMD_LIGHTS_ON
  * LightCommands.LIGHT_CMD_COLOR_SET
  * LightCommands.LIGHT_CMD_COLOR_SYNC
  * LightCommands.LIGHT_CMD_COLOR_SWIM
  * LightCommands.LIGHT_CMD_COLOR_MODE_PARTY
  * LightCommands.LIGHT_CMD_COLOR_MODE_ROMANCE
  * LightCommands.LIGHT_CMD_COLOR_MODE_CARIBBEAN
  * LightCommands.LIGHT_CMD_COLOR_MODE_AMERICAN
  * LightCommands.LIGHT_CMD_COLOR_MODE_SUNSET
  * LightCommands.LIGHT_CMD_COLOR_MODE_ROYAL
  * LightCommands.LIGHT_CMD_COLOR_SET_SAVE
  * LightCommands.LIGHT_CMD_COLOR_SET_RECALL
  * LightCommands.LIGHT_CMD_COLOR_BLUE
  * LightCommands.LIGHT_CMD_COLOR_GREEN
  * LightCommands.LIGHT_CMD_COLOR_RED
  * LightCommands.LIGHT_CMD_COLOR_WHITE
  * LightCommands.LIGHT_CMD_COLOR_PURPLE

### SLPingServerMessage

Passed as an argument to the emitted `pong` event handler.

### SLEquipmentStateMessage

Passed as an argument to the emitted `equipmentState` event handler.

#### isDeviceReady()

Returns a bool indicating whether the device is in a normal operating state.

#### isDeviceSync()

Returns a bool.

#### isDeviceServiceMode()

Returns a bool indicating whether the device is in service mode or not.

#### isSpaActive()

Returns a bool indicating whether the spa is currently active or not.

#### isPoolActive()

Returns a bool indicating whether the pool is currently active or not.

#### Properties

* `ok` - can be interpreted with `isDevice...` methods.
* `freezeMode` - byte representing whether the device is in freeze mode or not.
* `remotes` - byte
* `poolDelay` - byte
* `spaDelay` - byte
* `cleanerDelay` - byte
* `airTemp` - integer representing the current temperature (check controller config to see if it's in celsius or fahrenheit)
* `currentTemp` - array of size 0-2 indicating current temperature of each body as an integer (pool: 0, spa: 1) (check controller config to see if it's in celsius or fahrenheit)
* `heatStatus` - array of size 0-2 indicating whether heat is active or not for each body as an integer (pool: 0, spa: 1)
* `setPoint` - array of size 0-2 holding the heating set point for each body as an integer (pool: 0, spa: 1) (check controller config to see if it's in celsius or fahrenheit)
* `coolSetPoint` - array of size 0-2 holding the cooling set point for each body as an integer (pool: 0, spa: 1; the spa seems to always track air temperature for this, however) (check controller config to see if it's in celsius or fahrenheit)
* `heatMode` - array of size 0-2 indicating whether heating is enabled or not for each body as an integer (pool: 0, spa: 1)
* `circuitArray` - array holding all circuits in the system
  * `id` - integer representing the circuit's ID (spa is 500, pool is 505)
  * `state` - integer indicating whether the circuit is on or not (0/1)
  * `colorSet` - byte
  * `colorPos` - byte
  * `colorStagger` - byte
  * `delay` - byte
* `pH` - float indicating the current pH level (e.g.: 7.62)
* `orp` - integer indicating the current ORP value if available (e.g.: 650)
* `saturation` - float indicating the water balance/saturation level (e.g.: -0.13)
* `saltPPM` - integer indicating the salt level in parts-per-million (e.g.: 3000)
* `pHTank` - integer indicating the fill level of the pH tank (e.g.: 4)
* `orpTank` - integer indicating the fill level of the ORP tank
* `alarms` - integer indicating how many alarms are currently active

### SLRemoveClient

Passed as an argument to the emitted `removeClient` event.

### SLIntellichlorData

Passed as an argument to the emitted `intellichlorConfig` event handler.

#### Properties

* `installed` - boolean indicating whether a salt cell is installed or not
* `status` - integer bitmask
* `poolSetpoint` - integer indicating the output level of the salt cell for the pool. Valid setpoints are 40-104F or 4-40C.
* `spaSetpoint` - integer indicating the output level of the salt cell for the spa. Valid setpoints are 40-104F or 4-40C.
* `salt` - integer indicating salt level in parts-per-million
* `flags` - integer bitmask
* `superChlorTimer` - integer

### SLSetCircuitRuntimeById

Passed as an argument to the emitted `setCircuitRuntimebyId` event. Configures default run-time of a circuit, usually referred to as the 'egg timer'. This also applies to 'run-once' programs as this will set the length of the program.

#### Properties

* `circuitId` - id of the circuit to which this event applies to
* `runTime` - integer specifying the run time in minutes

### SLSetCircuitStateMessage

Passed as an argument to the emitted `circuitStateChanged` event.

#### Properties

* `circuitId` - integer indicating the ID of the circuit to set the state of.
  * This ID can be retrieved from `SLControllerConfig`'s `bodyArray` property.
* `circuitState` - integer indicating whether to switch the circuit on (`1`) or off (`0`).

### SLSetHeatModeMessage

Passed as an argument, returned to the emitted `heatModeChanged` event. Valid values depend on installed equipment.

#### Properties

* `controllerId` - integer indicating the ID of the controller to send this command to.
  * Note that while `SLControllerConfig` includes a controllerId, this ID, in my experience, should always be 0.
* `bodyType` - integer indicating the type of body to set the setpoint of. The pool is body `0` and the spa is body `1`.
* `heatMode` - integer indicating the desired heater mode. Valid values are:
  * HeatModes.HEAT_MODE_OFF
  * HeatModes.HEAT_MODE_SOLAR
  * HeatModes.HEAT_MODE_SOLARPREFERRED
  * HeatModes.HEAT_MODE_HEATPUMP
  * HeatModes.HEAT_MODE_DONTCHANGE

### SLSetHeatSetPointMessage

Passed as an argument to the emitted `setPointChanged` event. Receives a [BoolData](#booldata) object.

### SLSetIntellichlorConfigMessage

Passed as an argument to the emitted `setIntellichlorConfig` event.

#### Properties

* `controllerId` - integer indicating the ID of the controller to send this command to.
  * Note that while `SLControllerConfig` includes a controllerId, this ID, in my experience, should always be 0.
* `poolOutput` - integer indicating the output level of the salt cell for the pool. I believe this operates on a 0-100 scale.
* `spaOutput` - integer indicating the output level of the salt cell for the spa. I believe this operates on a 0-100 scale.

### SLSetScheduleEventById

Passed as an argument to the emitted `setScheduleEventById` event. Configures an event with properties as described below.

#### Properties

* `scheduleId` - id of a schedule previously created, see [scheduleaddNewScheduleEventAsync()`](#scheduleaddnewscheduleeventasyncscheduletype-senderid)
* `circuitId` - id of the circuit to which this event applies
* `startTime` - the start time of the event, specified as minutes since midnight (see [conversion functions](#encodetimetime))
  * example: 6:00am would be 360
  * example: 6:15am would be 375
* `stopTime` - the stop time of the event, specified as minutes since midnight (see [conversion functions](#encodetimetime))
* `dayMask`
  * 7-bit mask that determines which days the schedule is active for, MSB is always 0, valid numbers 1-127
* `flags`
  * bit 0 is the schedule type, if 0 then regular event, if 1 its a run-once
  * bit 1 indicates whether heat setPoint should be changed
* `heatCmd` - integer indicating the desired heater mode. Valid values are:
  * HeatModes.HEAT_MODE_OFF
  * HeatModes.HEAT_MODE_SOLAR
  * HeatModes.HEAT_MODE_SOLARPREFERRED
  * HeatModes.HEAT_MODE_HEATPUMP
  * HeatModes.HEAT_MODE_DONTCHANGE
* `heatSetPoint` - the temperature set point if heat is to be changed (ignored if bit 1 of flags is 0)

### SLSetSystemTime

Passed as an argument to the emitted `setSystemTime` event.

### SLVersionMessage

Passed as an argument to the emitted `version` event handler.

#### Properties

* `version` - a string representing the system's version

### SLWeatherForecastData

#### Properties

* `version` - number
* `zip` - string
* `lastUpdate` - Date
* `lastRequest` - Date
* `dateText` - string
* `text` - string
* `currentTemperature` - number
* `humidity` - number
* `wind` - string
* `pressure` - number
* `dewPoint` - number
* `windChill` - number
* `visibility` - number
* `dayData` - SLWeatherForecastDayData[]
  * `dayTime` - Date
  * `highTemp` - number
  * `lowTemp` - number
  * `text` - string
* `sunrise` - number
* `sunset` - number
