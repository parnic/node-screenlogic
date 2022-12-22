# node-screenlogic

This is a Node.JS module for interfacing with Pentair ScreenLogic systems over your local network or remotely through the Pentair dispatcher. Local connections require a Pentair ScreenLogic device on the same network (a network which supports UDP broadcasts).

Tested with a Pentair ScreenLogic system on firmware versions 5.2 Build 736.0 Rel, 5.2 Build 738.0 Rel

Breaking changes in 2.0:

* Async functions are wrappers around the remote calls.  All of the previous events are still present and should still be added to the listeners if you want to account for changes being broadcast from the ScreenLogic unit.
* All indexes are now 1 based.  Previously, indexes would refer to the internal Pentair numbering scheme (500 for circuits, 700 for schedules, 0 for bodies and pumps, etc).
* Data that was previously in arrays (body temperatures, air temperatures, etc) are now returned as objects with the attributes associated to the pool equipment

Table of Contents:

* [Usage](#usage)
* [Notes](#notes)
* [Packet format](#packet-format)
* [API reference](#api-reference)
  * [FindUnits](#findunits)
  * [RemoteLogin](#remotelogin)
  * [UnitConnection](#unitconnection)
  * [All messages](#all-messages)
    * [SLAddClientAsync](#sladdclient)
    * [SLAddNewScheduleEventAsync](#sladdnewscheduleevent)
    * [SLCancelDelayAsync](#slcanceldelay)
    * [SLChemDataMessageAsync](#slchemdata)
    * [SLControllerConfigAsync](#SLControllerConfig)
    * [SLDeleteScheduleEventByIdAsync](#sldeletescheduleeventbyid)
    * [SLGetChemHistoryDataAsync](#slgetchemhistorydata)
    * [SLGetGatewayDataMessageAsync](#slgetgatewaydatamessage)
    * [SLGetHistoryDataAsync](#slgethistorydata)
    * [SLGetPumpStatusAsync](#slgetpumpstatus)
    * [SLGetScheduleDataAsync](#slscheduledata)
    * [SLSystemTimeDataAsync](#slSystemTimeData)
    * [SLLightControlMessageAsync](#sllightcontrolmessage)
    * [SLPingServerMessageAsync](#slpingservermessage)
    * [SLPoolStatusMessageAsync](#slpoolstatusmessage)
    * [SLRemoveClientAsync](#slremoveclient)
    * [SLIntellichlorConfigMessageAsync](#slintellichlordata)
    * [SLSetCircuitRuntimeByIdAsync](#slsetcircuitruntimebyid)
    * [SLSetCircuitStateMessageAsync](#slsetcircuitstatemessage)
    * [SLSetHeatModeMessageAsync](#slsetheatmodemessage)
    * [SLSetHeatSetPointMessageAsync](#slsetheatsetpointmessage)
    * [SLSetPumpFlowAsync](#slsetpumpflow)
    * [SLSetIntellichlorConfigMessageAsync](#slsetintellichlorconfigmessage)
    * [SLSetScheduleEventByIdAsync](#slsetscheduleeventbyid)
    * [SLSetSystemTimeAsync](#slsetsystemtime)
    * [SLVersionMessageAsync](#slversionmessage)

## Usage

See example.ts for an example of interfacing with the library. Broadly, import the library with

```javascript
import * as Screenlogic from "./index";
```

Individual named imports can also be used.  Then for local connections create a new ScreenLogic unit finder with

```javascript
let finder = new ScreenLogic.FindUnits();
let localUnit = await finder.searchAsync();
return Promise.resolve(localUnit);
```

For backwards compatibility, every event from the original API is still available.  You could, for example, hook the `serverFound` event with

```javascript
.on('serverFound', function(server) { })
await finder.searchAsync();
```

and call it via `searchAsync()`. This performs a UDP broadcast on 255.255.255.255, port 1444, so ensure your network supports UDP broadcasts and the device is on the same subnet.

Alternatively, to find a unit remotely, create a new ScreenLogic remote login with

```javascript
let gateway = new ScreenLogic.RemoteLogin(systemName);  // systemName in the format "Pentair: xx-xx-xx"
let unit = await this._gateway.connectAsync();
if (!unit || !unit.gatewayFound || unit.ipAddr === '') {
  logger.error(`Screenlogic: No unit found called ${systemName}`);
  return;
}
await this._gateway.closeAsync();
```

and call it via `connectAsync()`. This opens a TCP connection to screenlogicserver.pentair.com, port 500.

When a local or remote server is found, create and connect to a new UnitConnection with

```javascript
let client = ScreenLogic.screenlogic;
client.init(systemName, ipAddr, port, password);  // ipAddr and password as strings; port as integere
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
const ScreenLogic = require('node-screenlogic');

var finder = new ScreenLogic.FindUnits();
```

#### searchAsync()

Issues one UDP broadcast search for available units. Since this is a stateless UDP query, the connection will not automatically be closed, so you may need to issue another search if the first one doesn't work, if your network connection is not established, etc. There is no automatic timeout or retry mechanism built in to this command.
Returns a serverFound object containing:
```
  address, // ip address
  type,
  port,
  gatewayType,
  gatewaySubtype,
  gatewayName
```

#### closeAsync()

Closes the socket.

#### Events

* `close` - Indicates that `close()` has been called on the finder.
* `error` - Indicates that an unhandled error was caught.
* `serverFound` - Indicates that a ScreenLogic unit has been found. Event handler receives a [`UnitConnection`](#unitconnection) object.  The async call is a wrapper for this event.

Examples:

```javascript
let finder = new ScreenLogic.FindUnits();
let localUnit = await finder.searchAsync();
// or hook the event if you don't assign the function to a variable
finder.on('serverFound', function(server) {
  // server object will contain connection information
})
```

* `error` - Indicates that an unhandled error was caught (such as the connection timing out)

### RemoteLogin

#### constructor(systemName)

Argument is the name of a system to connect to in "Pentair: xx-xx-xx" format.

Example:

```javascript
let gateway = new ScreenLogic.RemoteLogin(systemName);  // systemName in the format "Pentair: xx-xx-xx"
let unit = await this._gateway.connectAsync();
if (!unit || !unit.gatewayFound || unit.ipAddr === '') {
  logger.error(`Screenlogic: No unit found called ${systemName}`);
  return;
}
await this._gateway.closeAsync();
// or use the emit if you don't assign the function to a variable
```

#### connectAsync()

Connects to the dispatcher service and searches for the unit passed to its constructor.

#### closeAsync()

Closes the connection

#### Events

* `close` - Indicates that the connection to the remote login server has been closed. Event handler receives a bool indicating whether there was a transmission error.
* `error` - Indicates that an unhandled error was caught (such as the connection timing out).
* `gatewayFound` - Indicates that the search for the named unit has completed (may or may not be successful). Event handler receives a [`SLGetGatewayDataMessage`](#slgetgatewaydatamessage) argument.  The async function is a promise that wraps this event.

### screenlogic (previously called UnitConnection)

#### Module 

`screenlogic` is an exported module that maintains state and connection for a given unit.  Parameters are initialized with the `init` and connections are made with the `connectAsync` functions.

Examples:

```javascript
let client = ScreenLogic.screenlogic;
client.init(systemName, unit.ipAddr, unit.port, password);
await client.connectAsync();
```

#### init(address, port, password)

Port is an integer. Address is an IPv4 address of the server as a string. Password is optional; should be the 4-digit password in string form, e.g. `'1234'`.

Previously, `senderId` would be an optional 16-bit integer that can be added to each function call.  Now, senderId can be set once (or it will be assigned randomly) and will be present as the `senderId` field on the returned message.

Examples:

```javascript
client.init('Pentair: 00-00-00', '10.0.0.85', 80, '1234', senderId?);
```

#### connectAsync()

Connects to the server after `init()`.

Examples:

```javascript
await client.connectAsync();
```

#### closeAsync()

Closes the connection.

#### addClientAsync(clientId?)

Registers to receive updates from controller when something changes. Takes a random number `clientId` (if passed, or will be randomly assigned) to identify the client. Resolves/emits the `poolStatus` event when something changes on the controller, and the `addClient` event when the request to add a client is acknowledged. 

#### schedule.addNewScheduleEventAsync(scheduleType)

Adds a new event to the specified schedule type. See [`SLAddNewScheduleEvent`](#sladdnewscheduleevent) documentation for argument values. Emits either the `addNewScheduleEvent` or `scheduleChanged` event when response is acknowledged (listen for both).

#### equipment.cancelDelayAsync()

Cancels any delays on the system. ~~See [`SLCancelDelay`](#slcanceldelay) documentation.~~ Resolves/emits the `cancelDelay` event (with a boolean as the returned object) when response is acknowledged.

#### schedule.deleteScheduleEventByIdAsync(scheduleId)

Deletes a scheduled event with specified id. See [`SLDeleteScheduleEventById`](#sldeletescheduleeventbyid) documentation for argument values. Resolves/emits the `deleteScheduleById` or `scheduleChanged` event when response is acknowledged (listen for both).

#### chem.getChemHistoryDataAsync(fromTime?, toTime?): SLChemHistory

Requests chemical history data from the connected unit. This is information about the pH and ORP readings over time and when pH and ORP feeds were turned on and off. `fromTime` is the time (as a Javascript Date object) that you want to get events from and `toTime` is the time (as a Javascript Date object) that you want to get events until. If omitted, data will be resolved for the past 24 hours.  Resolves/emits the `getChemHistoryDataPending` event when the request to get data is confirmed, then the `getChemHistoryData` event when the chemical history data is actually ready to be handled.

#### chem.getChemicalDataAsync(): SLChemData

Requests chemical data from the connected unit (may require an IntelliChem or similar). Resolves/emits the `chemicalData` event when the response comes back.

#### equipment.getControllerConfig(): SLControllerConfigData

Requests controller configuration from the connected unit. Resolves/emits the `controllerConfig` event when the response comes back.

#### equipment.getCustomNamesAsync(): string[]

Requests all custom names from the OCP.  An array of 20 names will be returned, but some OCP's only support 10.  Emits the `getCustomNames` event.

#### equipment.getEquipmentConfigurationAsync(): SLEquipmentConfigurationData

Resolves/emits the `equipmentConfiguration` event when the response comes back.  This is the basic configuration of what equipment is installed on the controller.  

export interface SLEquipmentConfigurationData {
  controllerType: number;
  hardwareType: number;
  expansionsCount: number;
  version: number;
  pumps: any;
  heaterConfig: HeaterConfig;
  valves: Valves[];
  delays: Delays;
  misc: Misc;
  speed: any[],
  numPumps: number;
}

#### equipment.getEquipmentStateAsync(): SLEquipmentStateData

Resolves/emits the `equipmentState` event when the response comes back.  This is the current state of all equipment in the system.

#### equipment.getHistoryDataAsync(fromTime?, toTime?): SLHistoryData

Requests history data from the connected unit. This is information like what various temperature sensors (air, water) read over time, changes in heat setpoints, and when various circuits (pool, spa, solar, heater, and lights) were turned on and off. `fromTime` is the time (as a Javascript Date object) that you want to get events from and `toTime` is the time (as a Javascript Date object) that you want to get events until. Will default to the last 24 hours if fromTime/toTime are not provided.  Resolves/emits the `getHistoryDataPending` event when the request to get data is confirmed, then the `getHistoryData` event when the history data is actually ready to be handled.

#### getPoolStatus()

Requests pool status from the connected unit. Resolves/emits the `poolStatus` event when the response comes back.

#### pump.getPumpStatusAsync(pumpId)

Gets information about the specified pump. See [`SLGetPumpStatus`](#slgetpumpstatus) documentation for argument values. Resolves/emits the `getPumpStatus` event when response is acknowledged.

#### chlor.getIntellichlorConfig(): SLIntellichlorData

Requests salt cell status/configuration from the connected unit (requires an IntelliChlor or compatible salt cell). Resolves/emits the `intellichlorConfig` event when the response comes back.

#### schedule.getScheduleDataAsync(scheduleType): SLScheduleData[]

Retrieves a list of schedule events of the specified type. See [`SLGetScheduleData`](#slscheduledata) documentation for argument values. Resolves/emits the `getScheduleData` event when response is acknowledged.

#### equipment.getSystemTimeAsync(): SLSystemTimeData

Retrieves the current time the system is set to. Resolves/emits the `getSystemTime` event when response is received.

#### getVersion()

Requests the system version string from the connected unit. Resolves/emits the `version` event when the response comes back.

#### equipment.getWeatherForecastAsync(): SLWeatherForecastData

Requests the system version string from the connected unit. Resolves/emits the `weatherForecast` event when the response comes back.

#### pingServer()

Sends a ping to the server to keep the connection alive. Resolves/emits the `pong` event when the response comes back.

#### removeClient(clientId)

No longer receive `poolStatus` messages from controller. Resolves/emits the `removeClient` event when the request to remove a client is acknowledged. Takes a random number `clientId` that should match a previously registered client with `addClient`.

#### circuit.sendLightCommandAsync(command): boolean

Sends a lighting command. See [`SLLightControlMessage`](#sllightcontrolmessage) documentation for argument values. Resolves/emits a boolean event when response is acknowledged.

~~Note that better/more complete handling of lighting is desired, but I have yet to find all the commands I need to implement to make that happen. This currently sends each command to all lights and there is no ability to send to an individual light. Pull requests adding more functionality here would be most welcome.~~ EasyTouch/Intellitouch only have a single light group and individual lights cannot be address.  Pentair's Intellicenter offers this capability as does the Nixie controller in the nodejs-poolController project.  


#### circuit.setCircuitRuntimebyId(circuitId, runTime): boolean

Configures default run-time of a circuit, usually referred to as the 'egg timer'. This also applies to 'run-once' programs as this will set the length of the program. See [`SLSetCircuitRuntimeById`](#slsetcircuitruntimebyid) documentation for argument values. Resolves/emits the `setCircuitRuntimeById` event when response is acknowledged.


#### circuit.setCircuitAsync(circuitId, nameIndex, circuitFunction, circuitInterface, freeze, colorPos): boolean

Sets the configuration for a specific circuit.  

#### circuit.setCircuitState(circuitId, circuitState)

Activates or deactivates a circuit. See [`SLSetCircuitStateMessage`](#slsetcircuitstatemessage) documentation for argument values. Resolves/emits the `circuitStateChanged` event when response is acknowledged.

#### circuit.setHeatModeAsync(bodyId, heatMode)

Sets the preferred heat mode. See [`SLSetHeatModeMessage`](#slsetheatmodemessage) documentation for argument values. Resolves/emits the `heatModeChanged` event when response is acknowledged.

#### chlor.setIntellichlorOutputAsync(poolOutput, spaOutput)

Sets the salt cell's output levels. See [`SLSetIntellichlorConfigMessage`](#slsetintellichlorconfigmessage) documentation for argument values. Resolves/emits the `setIntellichlorConfig` event when response is acknowledged.

#### schedule.setScheduleEventById(scheduleId, circuitId, startTime, stopTime, dayMask, flags, heatCmd, heatSetPoint)

Configures a schedule event. See [`SLSetScheduleEventById`](#slsetscheduleeventbyid) documentation for argument values. Resolves/emits the `setScheduleEventById` or `scheduleChanged` event when response is acknowledged (listen for both).

#### circuit.setSetPointAsync(bodyId, temperature): boolean

Sets the heating setpoint for any body. See [`SLSetHeatSetPointMessage`](#slsetheatsetpointmessage) documentation for argument values. Resolves/emits the `setPointChanged` event when response is acknowledged.

#### pump.setPumpSpeedAsync(pumpId, circuitId, setPoint, isRPMs?): boolean

Sets speed (rpm) or flow (gpm) setting for a pump/circuit combination. See [`SLSetPumpFlow`](#slsetpumpflow) documentation for argument values. Resolves/emits the `setPumpFlow` event when response is acknowledged.

#### equipment.setSystemTimeAsync(date, adjustForDST): SLSystemTimeData

Sets the current date and time of the ScreenLogic system. Resolves/emits the `setSystemTime` event when request is acknowledged. `date` must be a `Date` instance holding the date/time to set, and `adjustForDST` must be a boolean indicating whether the system should adjust for daylight saving time or not.

### Events

* `addClient` - Indicates that a response to `addClientAsync()` has been received. Event handler receives a [`SLAddClient`](#sladdclient) object.
* `addNewScheduleEvent` - Indicates that a response to `addNewScheduleEventAsync()` has been received which contains the created `scheduleId` to be used later for setting up the properties. Event handler receives a [`SLAddNewScheduleEvent`](#sladdnewscheduleevent) object.
* `badParameter` - Indicates that a bad parameter has been supplied to a function. This can be triggered, for example, by sending the wrong controller ID to a `set` function.
* `cancelDelay` - Indicates that a response to `cancelDelayAsync()` has been received. Event handler receives a boolean object.
* `chemicalData` - Indicates that a response to `getChemicalDataAsync()` has been received. Event handler receives a [`SLChemDataMessage`](#slchemdata) object.
* `circuitStateChanged` - Indicates that a response to `setCircuitStateAsync()` has been received. Event handler receives a [`SLSetCircuitStateMessage`](#slsetcircuitstatemessage) object.
* `close` - Indicates that the connection to the unit has been closed. Event handler receives a bool indicating whether there was a transmission error.
* `controllerConfig` - Indicates that a response to `getControllerConfigAsync()` has been received. Event handler receives a [`SLControllerConfigData`](#SLControllerConfigData) object.
* `deleteScheduleById` - Indicates that a response to `deleteScheduleByIdAsync()` has been received. Event handler receives a [`SLDeleteScheduleEventById`](#sldeletescheduleeventbyid) object.
* `error` - Indicates that an unhandled error was caught (such as the connection timing out)
* `equipmentConfiguration` - Indicates a response to `getEquipmentConfigurationAsync()`.  Receives a [`SLEquipmentConfigurationData`](#slequipmentconfigurationdata) object.
* `equipmentState` - Indicates a response to `getEquipmentStateAsync()`.  Receives a [`SLEquipmentStateData`](#slequipmentstatedata) object.
* `getChemHistoryData` - Indicates that chemical history data for the requested timeframe is ready. Event handler receives a [`SLGetChemHistoryData`](#slgetchemhistorydata) object.
* `getChemHistoryDataPending` - Indicates that the `getChemHistoryDataAsync()` request has been received and is being processed.
* `getHistoryData` - Indicates that history data for the requested timeframe is ready. Event handler receives a [`SLGetHistoryData`](#slgethistorydata) object.
* `getHistoryDataPending` - Indicates that the `getHistoryDataAsync()` request has been received and is being processed.
* `getPumpStatus` - Indicates that a response to `getPumpStatusAsync()` has been received. Event handler receives a [`SLGetPumpStatus`](#slgetpumpstatus) object.
* `getScheduleData` - Indicates that a response to `getScheduleDataAsync()` has been received. Event handler receives a [`SLGetScheduleData`](#slscheduledata) object.
* `getSystemTime` - Indicates that a response to `getSystemTimeAsync()` has been received. Event handler receives a [`SLSystemTimeData`](#slSystemTimeData) object.
* `heatModeChanged` - Indicates that a response to `setHeatModeAsync()` has been received. Event handler receives a [`SLSetHeatModeMessage`](#slsetheatmodemessage) object.
* `loggedIn` - Indicates that a connection to the server has been established and the login process completed. `get` methods can be called once this event has been emitted.
* `loginFailed` - Indicates that a remote login attempt via supplying a system address and password to `UnitConnection` has failed likely due to the incorrect password being used.
* `pong` - Indicates that a response to `pingServerAsync()` has been received. Event handler receives a [`SLPingServerMessage`](#slpingservermessage) object.
* `poolStatus` - Indicates that a response to `getPoolStatusAsync()` has been received. Event handler receives a [`SLPoolStatusMessage`](#slpoolstatusmessage) object.
* `removeClient` - Indicates that a response to `removeClientAsync()` has been received. Event handler receives a [`SLRemoveClient`](#slremoveclient) object.
* `intellichlorConfig` - Indicates that a response to `getIntellichlorConfigAsync()` has been received. Event handler receives a [`SLIntellichlorConfigMessage`](#slintellichlordata) object.
* `scheduleChanged` - Indicates that a response to adding, deleting, or setting a schedule has been received. Event handler receives nothing. This seems to be arbitrarily returned sometimes instead of a normal ack by the system.
* `sentLightCommand` - Indicates that a response to `sendLightCommandAsync()` has been received. Event handler receives a [`SLLightControlMessage`](#sllightcontrolmessage) object.
* `setCircuitRuntimeById` - Indicates that a response to `setCircuitRuntimeByIdAsync()` has been received. Event handler receives a [`SLSetCircuitRuntimeById`](#slsetcircuitruntimebyid) object.
* `setPumpFlow` - Indicates that a response to `setPumpFlowAsync()` has been received. Event handler receives a [`SLSetPumpFlow`](#slsetpumpflow) object.
* `setPointChanged` - Indicates that a response to `setSetPointAsync()` has been received. Event handler receives a [`SLSetHeatSetPointMessage`](#slsetheatsetpointmessage) object.
* `setIntellichlorConfig` - Indicates that a response to `setIntellichlorOutputAsync()` has been received. Event handler receives a [`SLSetIntellichlorConfigMessage`](#slsetintellichlorconfigmessage) object.
* `setScheduleEventById` - Indicates that a response to `setScheduleEventByIdAsync()` has been received. Event handler receives a [`SLSetScheduleEventById`](#slsetscheduleeventbyid) object.
* `setSystemTime` - Indicates that a response to `setSystemTimeAsync()` has been received. Event handler receives a [`SLSetSystemTime`](#slsetsystemtime) object if the request was valid, or `null` if the request was invalid (input parameters were not of the required types).
* `unknownCommand` - Indicates that an unknown command was issued to ScreenLogic (should not be possible to trigger when using the supplied `UnitConnection` methods).
* `version` - Indicates that a response to `getVersionAsync()` has been received. Event handler receives a [`SLVersionMessage`](#slversionmessage) object.

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

Converts an array of DAY_VALUES into a mask used by, for example, `SLGetScheduleData`'s events[idx].days property.

#### getDayValue(dayName)

Returns the value of a given `DAY_VALUES` day name.

`DAY_VALUES` is defined as the following array for simplicity of checking whether a specific day is set in a mask:

```js
const DAY_VALUES = [
  ['Mon', 0x1 ],
  ['Tue', 0x2 ],
  ['Wed', 0x4 ],
  ['Thu', 0x8 ],
  ['Fri', 0x10 ],
  ['Sat', 0x20 ],
  ['Sun', 0x40 ],
];
```

#### Properties

* `senderId` - an integer matching whatever was passed as the `senderId` argument when making the initial request (default 0)
* `messageId` - an integer indicating the ScreenLogic ID for this message

### SLAddClient

Passed as an argument to the emitted `addClient` event.

### SLAddNewScheduleEvent

Passed as an argument to the emitted `addNewScheduleEvent` event. Adds a new event to the specified schedule type, either 0 for recurring events or 1 for one-time events.

#### Properties

* `scheduleType` - 0 indicates recurring scheduled events, 1 indicates a run-once event

### ~~SLCancelDelay~~

~~Passed as an argument to the emitted `cancelDelay` event.~~

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

### SLControllerConfigData

Passed as an argument to the emitted `controllerConfig` event handler.

```
export interface SLControllerConfigData {
  controllerId: number;
  minSetPoint: number[];
  maxSetPoint: number[];
  degC: boolean;
  controllerType;
  circuitCount: number,
  hwType;
  controllerData;
  equipment: Equipment;
  genCircuitName;
  interfaceTabFlags: number;
  circuitArray: Circuit[];
  colorCount: number;
  colorArray: any[];
  pumpCircCount: number;
  pumpCircArray: any[];
  showAlarms: number;
}
```

#### SLEquipmentStateData

Passed as an argument to the `equipmentConfig` event handler.

```
export interface SLControllerConfigData {
  controllerId: number;
  minSetPoint: number[];
  maxSetPoint: number[];
  degC: boolean;
  controllerType;
  circuitCount: number,
  hwType;
  controllerData;
  equipment: Equipment;
  genCircuitName;
  interfaceTabFlags: number;
  circuitArray: Circuit[];
  colorCount: number;
  colorArray: any[];
  pumpCircCount: number;
  pumpCircArray: any[];
  showAlarms: number;
}
```

#### hasSolar()

Returns a bool indicating whether the system has solar present. (Helper method for interpreting the value in `equipFlags`.)

#### hasSolarAsHeatpump()

Returns a bool indicating whether the system has a solar heatpump (UltraTemp, ThermalFlo) present. (Helper method for interpreting the value in `equipFlags`.)

#### hasChlorinator()

Returns a bool indicating whether the system has a chlorinator present. (Helper method for interpreting the value in `equipFlags`.)

#### hasCooling()

Returns a bool indicating whether the system has a cooler present. (Helper method for interpreting the value in `equipFlags`.)

#### hasIntellichem()

Returns a bool indicating whether the system has an IntelliChem chemical management system present. (Helper method for interpreting the value in `equipFlags`.)

#### isEasyTouch()

Returns a bool indicating whether the system is an EasyTouch system or not. (Helper method for interpreting the value in `controllerType`.)

#### isIntelliTouch()

Returns a bool indicating whether the system is an IntelliTouch system or not. (Helper method for interpreting the value in `controllerType`.)

#### isEasyTouchLite()

Returns a bool indicating whether the system is an EasyTouch Lite system or not. (Helper method for interpreting the value in `controllerType` and `hwType`.)

#### isDualBody()

Returns a bool indicating whether the system is dual-body or not. (Helper method for interpreting the value in `controllerType`.)

#### isChem2()

Returns a bool indicating whether the system is a Chem2 system or not. (Helper method for interpreting the value in `controllerType` and `hwType`.)

#### getCircuitByDeviceId(deviceId)

Returns the `bodyArray` entry for the circuit matching the given device id. This is most useful with an [`SLGetPumpStatus`](#slgetpumpstatus) message.

#### Properties

* `controllerId` - integer indicating the controller's ID
* `minSetPoint` - array (size 2) indicating the minimum setpoint available for the pool (index 0) or spa (index 1)
* `maxSetPoint` - array (size 2) indicating the maximum setpoint available for the pool (index 0) or spa (index 1)
* `degC` - boolean indicating whether the system is using the centigrade scale for temperatures or not
* `controllerType` - byte
* `hwType` - byte
* `controllerData` - byte
* `equipFlags` - integer indicating the type(s) of equipment present in the system (see helper methods above for interpreting these values)
* `genCircuitName` - string indicating the circuit name
* `bodyArray` - array (size number-of-circuits) holding circuit data
  * `circuitId` - integer indicating circuit ID (e.g.: 500 is spa, 505 is pool)
  * `name` - string representing the name of the circuit
  * `nameIndex` - byte
  * `function` - byte
  * `interface` - byte
  * `flags` - byte
  * `colorSet` - byte
  * `colorPos` - byte
  * `colorStagger` - byte
  * `deviceId` - byte
  * `dfaultRt` - short
* `colorArray` - array (size number-of-colors) holding data about available light colors
  * `name` - color name
  * `color` - object containing `r`/`g`/`b` properties as bytes (values from 0-255) indicating the color
* `pumpCircArray` - array (size 8) holding data about pumps attached to the system
* `interfaceTabFlags` - integer
* `showAlarms` - integer

### SLDeleteScheduleEventById

Passed as an argument to the emitted `deleteScheduleEventById` event. Deletes a scheduled event with specified id.

#### Properties

* `scheduleId` - the scheduleId of the schedule to be deleted

### SLGetChemHistoryData

Passed as an argument to the emitted `getChemHistoryData` event. Contains information about the remote unit's pH and ORP readings over time as well as pH and ORP feed on/off times.

#### Properties

* `phPoints` - array of objects containing the pH reading over time. Each object contains a `time` key containing a Javascript Date object, and a `pH` key containing the pH reading as a float.
* `orpPoints` - array of objects containing the ORP reading over time. Each object contains a `time` key containing a Javascript Date object, and an `orp` key containing the ORP reading as an integer.
* `phRuns` - array of objects containing the pH feed on/off times. Each object contains an `on` key containing a Javascript Date object for when the feed turned on, and an `off` key containing a Javascript Date object for when the feed turned off.
* `orpRuns` - array of objects containing the ORP feed on/off times. Each object contains an `on` key containing a Javascript Date object for when the feed turned on, and an `off` key containing a Javascript Date object for when the feed turned off.

### SLGetGatewayDataMessage

Passed as an argument to the emitted `gatewayFound` event. Contains information about the remote unit's status and access properties.

#### Properties

* `gatewayFound` - boolean indicating whether a unit was found
* `licenseOK` - boolean indicating if the license is valid (I've never seen this be false)
* `ipAddr` - string containing the ipv4 address to remotely connect to this unit
* `port` - number containing the port to connect to the unit
* `portOpen` - boolean indicating whether or not the port is open and able to be connected to
* `relayOn` - boolean indicating whether the relay is on (unsure what exactly this indicates; it's always been false in my tests)

### SLGetHistoryData

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

### SLGetPumpStatus

Passed as an argument to the emitted `getPumpStatus` event. Gets information about the specified pump.

#### Properties

* `pumpId` - id of pump to get information about, first pump is 1

#### Return Values

* `isRunning` - boolean that says if pump is running
* `pumpType` - 0 if not installed or one of the IntelliFlo constants:
  * ScreenLogic.PUMP_TYPE_INTELLIFLOVF
  * ScreenLogic.PUMP_TYPE_INTELLIFLOVS
  * ScreenLogic.PUMP_TYPE_INTELLIFLOVSF
* `pumpWatts` - current Watts usage of the pump
* `pumpRPMs` - current RPMs of the pump
* `pumpGPMs` - current GPMs of the pump
* `pumpCircuits` - Array of 8 items each containing
  * `circuitId` - Circuit Id (CircuitId matched data returned by [`SLControllerConfig`](#SLControllerConfig)'s `getCircuitByDeviceIdAsync()`)
  * `pumpSetPoint` - the set point for this pump/circuit combo (in either RPMs or GPMs depending on the value of `isRPMs`)
  * `isRPMs` - boolean indicating if the set point is in RPMs (false means it's in GPMs)
* `pumpUnknown1` - unknown data; always 0
* `pumpUnknown2` - unknown data; always 255

### SLScheduleData

Passed as an argument to the emitted `getScheduleData` event. Retrieves a list of schedule events of the specified type, either 0 for regular events or 1 for one-time events.

#### Properties

* `eventCount` - the number of `events` returned
* `events` - array containing:
  * `scheduleId` - the associated scheduleId
  * `circuitId` - the circuit this schedule affects
  * `startTime` - the start time of the event, specified as a string in 24-hour time, so, for example, 6:00AM would be '0600' (see [conversion functions](#decodetimetime))
  * `stopTime` - the stop time of the event, specified as a string in 24-hour time, so, for example, 6:00AM would be '0600' (see [conversion functions](#decodetimetime))
  * `dayMask` - 7-bit mask that determines which days the schedule is active for, MSB is always 0, valid numbers 1-127 (see [conversion functions](#decodedaymaskmask))
  * `flags`
    * bit 0 is the schedule type, if 0 then regular event, if 1 its a run-once
    * bit 1 indicates whether heat setPoint should be changed
  * `heatCmd` - integer indicating the desired heater mode. Valid values are:
    * ScreenLogic.HEAT_MODE_OFF
    * ScreenLogic.HEAT_MODE_SOLAR
    * ScreenLogic.HEAT_MODE_SOLARPREFERRED
    * ScreenLogic.HEAT_MODE_HEATPUMP
    * ScreenLogic.HEAT_MODE_DONTCHANGE
  * `heatSetPoint` - the temperature set point if heat is to be changed (ignored if bit 1 of flags is 0)
  * `days` - which days this schedule is active for; this is just the `dayMask` property run through [`decodeDayMask()`](#decodedaymaskmask) for convenience

### SLSystemTimeData

Contains information about the system's current time and date. Passed as a return object/
an argument to the emitted `getSystemTimeAsync` event.
```
export interface SLSystemTimeData {
  date: Date;
  year: any;
  month: any;
  dayOfWeek: any;
  day: any;
  hour: any;
  minute: any;
  second: any;
  millisecond: any;
  adjustForDST: boolean;
}
```

#### Properties

* `date` - `Date` instance representing the current system datetime (preferred, the other properties are derived from this one and provided for backward compatibility purposes)
* `year` - short representing current system year
* `month` - short representing current system month (where 1 is January, 2 is February, etc.)
* `day` - short representing current system day of the month
* `dayOfWeek` - short representing current system day of the week (where 1 is Sunday and 7 is Saturday)
* `hour` - short representing current system hour (24-hour time where 0 is midnight, 13 is 1PM, etc.)
* `minute` - short representing current system minute
* `second` - short representing current system second
* `millisecond` - short representing current system millisecond
* `adjustForDST` - bool indicating whether the system should adjust for daylight saving time or not

### SLLightControlMessage

Passed as an argument to `sentLightCommandAsync`.  Can be one of:

```
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
```

#### Properties

* `controllerId` - integer indicating the ID of the controller to send this command to.
  * Note that while `SLControllerConfig` includes a controllerId, this ID, in my experience, should always be 0.
* `command` - integer indicating which command to send to the lights. Valid values are:
  * ScreenLogic.LIGHT_CMD_LIGHTS_OFF
  * ScreenLogic.LIGHT_CMD_LIGHTS_ON
  * ScreenLogic.LIGHT_CMD_COLOR_SET
  * ScreenLogic.LIGHT_CMD_COLOR_SYNC
  * ScreenLogic.LIGHT_CMD_COLOR_SWIM
  * ScreenLogic.LIGHT_CMD_COLOR_MODE_PARTY
  * ScreenLogic.LIGHT_CMD_COLOR_MODE_ROMANCE
  * ScreenLogic.LIGHT_CMD_COLOR_MODE_CARIBBEAN
  * ScreenLogic.LIGHT_CMD_COLOR_MODE_AMERICAN
  * ScreenLogic.LIGHT_CMD_COLOR_MODE_SUNSET
  * ScreenLogic.LIGHT_CMD_COLOR_MODE_ROYAL
  * ScreenLogic.LIGHT_CMD_COLOR_SET_SAVE
  * ScreenLogic.LIGHT_CMD_COLOR_SET_RECALL
  * ScreenLogic.LIGHT_CMD_COLOR_BLUE
  * ScreenLogic.LIGHT_CMD_COLOR_GREEN
  * ScreenLogic.LIGHT_CMD_COLOR_RED
  * ScreenLogic.LIGHT_CMD_COLOR_WHITE
  * ScreenLogic.LIGHT_CMD_COLOR_PURPLE

### SLPingServerMessage

Passed as an argument to the emitted `pong` event handler.

### SLPoolStatusMessage

Passed as an argument to the emitted `poolStatus` event handler.

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

* `controllerId` - integer indicating the ID of the controller to send this command to.
  * Note that while `SLControllerConfig` includes a controllerId, this ID, in my experience, should always be 0.
* `circuitId` - integer indicating the ID of the circuit to set the state of.
  * This ID can be retrieved from `SLControllerConfig`'s `bodyArray` property.
* `circuitState` - integer indicating whether to switch the circuit on (`1`) or off (`0`).

### SLSetHeatModeMessage

Passed as an argument, returned to the emitted `heatModeChanged` event.  Valid values depend on installed equipment.

```
export enum HeatModes {
  HEAT_MODE_OFF = 0,
  HEAT_MODE_SOLAR = 1,
  HEAT_MODE_SOLARPREFERRED = 2,
  HEAT_MODE_HEATPUMP = 3,
  HEAT_MODE_HEATER = 3,
  HEAT_MODE_DONTCHANGE = 4
}
```

#### Properties

* `controllerId` - integer indicating the ID of the controller to send this command to.
  * Note that while `SLControllerConfig` includes a controllerId, this ID, in my experience, should always be 0.
* `bodyType` - integer indicating the type of body to set the setpoint of. The pool is body `0` and the spa is body `1`.
* `heatMode` - integer indicating the desired heater mode. Valid values are:
  * ScreenLogic.HEAT_MODE_OFF
  * ScreenLogic.HEAT_MODE_SOLAR
  * ScreenLogic.HEAT_MODE_SOLARPREFERRED
  * ScreenLogic.HEAT_MODE_HEATPUMP
  * ScreenLogic.HEAT_MODE_DONTCHANGE

### SLSetHeatSetPointMessage

Passed as an argument to the emitted `setPointChanged` event.  Body 0 = pool/lo-temp, Body 1 = spa/high-temp.  

#### Properties

* `controllerId` - integer indicating the ID of the controller to send this command to.
  * Note that while `SLControllerConfig` includes a controllerId, this ID, in my experience, should always be 0.
* `bodyType` - integer indicating the type of body to set the setpoint of. The pool is body `0` and the spa is body `1`.
* `temperature` - integer indicating the desired setpoint. This is presumably in whatever units your system is set to (celsius or fahrenheit).

### SLSetPumpFlow

Passed as an argument to the emitted `setPumpFlow` event. Sets flow setting for a pump/circuit combination.

#### Properties

* `pumpId` - id of pump to get information about, first pump is 0
* `circuitId` - index of circuit for which to change the set point (id of the pump as returned by [`SLGetPumpStatus`](#slgetpumpstatus))
* `setPoint` - the value for which to set the pump/circuit combo
* `isRPMs` - optional (will be inferred).  boolean, `true` for RPMs, `false` for GPMs

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

* `scheduleId` - id of a schedule previously created, see [`SLAddNewScheduleEvent`](#sladdnewscheduleevent)
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
  * ScreenLogic.HEAT_MODE_OFF
  * ScreenLogic.HEAT_MODE_SOLAR
  * ScreenLogic.HEAT_MODE_SOLARPREFERRED
  * ScreenLogic.HEAT_MODE_HEATPUMP
  * ScreenLogic.HEAT_MODE_DONTCHANGE
* `heatSetPoint` - the temperature set point if heat is to be changed (ignored if bit 1 of flags is 0)

### SLSetSystemTime

Passed as an argument to the emitted `setSystemTime` event.

### SLVersionMessage

Passed as an argument to the emitted `version` event handler.

#### Properties

* `version` - a string representing the system's version
