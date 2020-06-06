# node-screenlogic

This is a Node.JS library for interfacing with Pentair ScreenLogic systems over your local network or remotely through the Pentair dispatcher. Local connections require a Pentair ScreenLogic device on the same network (a network which supports UDP broadcasts).

Tested on node v8.11.1, v10.15.1 with a system on firmware versions 5.2 Build 736.0 Rel, 5.2 Build 738.0 Rel

# Usage

See example.js for an example of interfacing with the library. Broadly, import the library with

```javascript
const ScreenLogic = require('node-screenlogic');
```

then for local connections create a new ScreenLogic unit finder with

```javascript
new ScreenLogic.FindUnits();
```

Hook its `serverFound` event with

```javascript
.on('serverFound', function(server) { })
```

and call it via `search()`. This performs a UDP broadcast on 255.255.255.255, port 1444, so ensure your network supports UDP broadcasts and the device is on the same subnet.

Alternatively, to find a unit remotely, create a new ScreenLogic remote login with

```javascript
new ScreenLogic.RemoteLogin('Pentair: xx-xx-xx')
```

Hook its `gatewayFound` event with

```javascript
.on('gatewayFound', function(unit) { })
```

and call it via `connect()`. This opens a TCP connection to screenlogicserver.pentair.com, port 500.

When a local or remote server is found, create a new UnitConnection with

```javascript
new ScreenLogic.UnitConnection(server);
```

or

```javascript
new ScreenLogic.UnitConnection(unit.port, unit.ipAddr, '1234')
```
where `'1234'` is the remote login password.

Once you've connected with `connect()`, there are a number of methods available and corresponding events for when they've completed successfully. See [UnitConnection](#unitconnection) API reference.

All communication with a ScreenLogic unit is done via TCP, so responses will come back in the order they were requested.

# Notes

Contributions welcome. There are lots of available messages supported by ScreenLogic that the app doesn't support yet, but can be added pretty easily as needed.

# Packet format

All ScreenLogic packets are sent with an 8-byte header. The first 2 bytes are a little-endian-encoded sender ID (which is normally specified when making the original request). The second 2 bytes are a little-endian-encoded message ID. The final 4 bytes are a little-endian-encoded length of the data payload on the packet. The data payload is handled per-message.

# API Reference

Pull requests to document undocumented properties are most welcome.

## FindUnits

### constructor()

Examples:
```javascript
const ScreenLogic = require('node-screenlogic');

var finder = new ScreenLogic.FindUnits();
```

### search()

Begins a UDP broadcast search for available units.

### close()

Closes the socket.

### Events

* `serverFound` - Indicates that a ScreenLogic unit has been found. Event handler receives a [`UnitConnection`](#unitconnection) object.

Examples:
```javascript
finder.on('serverFound', function(server) {
  var client = new ScreenLogic.UnitConnection(server);
})
```

* `error` - Indicates that an unhandled error was caught (such as the connection timing out)

## RemoteLogin

### constructor(systemName)

Argument is the name of a system to connect to in "Pentair: xx-xx-xx" format.

Example:
```javascript
const ScreenLogic = require('./index');

var remoteLogin = new ScreenLogic.RemoteLogin('Pentair: xx-xx-xx');
```

### connect()

Connects to the dispatcher service and searches for the unit passed to its constructor.

### close()

Closes the connection

### Events

* `gatewayFound` - Indicates that the search for the named unit has completed (may or may not be successful). Event handler receives a [`SLGetGatewayDataMessage`](#slgetgatewaydatamessage) argument.
* `error` - Indicates that an unhandled error was caught (such as the connection timing out)

## UnitConnection

### constructor(server)

Argument is a server returned from [`FindUnits`](#findunits) `serverFound` event.

Examples:
```javascript
finder.on('serverFound', function(server) {
  var client = new ScreenLogic.UnitConnection(server);
})
```

```javascript
remoteLogin.on('gatewayFound', function(unit) {
  if (unit && unit.gatewayFound) {
    var client = new ScreenLogic.UnitConnection(unit.port, unit.ipAddr, '1234'));
  }
});
```

### constructor(port, address, password)

Port is an integer. Address is an IPv4 address of the server as a string. Password is optional; should be the 4-digit password in string form, e.g. `'1234'`.

Examples:
```javascript
var client = new ScreenLogic.UnitConnection(80, '10.0.0.85', '1234')
```

### connect()

Connects to the server passed to its constructor.

Examples:
```javascript
var client = new ScreenLogic.UnitConnection(server);
client.connect();
```

### close()

Closes the connection.

### getVersion()

Requests the system version string from the connected unit. Emits the `version` event when the response comes back.

### getPoolStatus()

Requests pool status from the connected unit. Emits the `poolStatus` event when the response comes back.

### getChemicalData()

Requests chemical data from the connected unit (may require an IntelliChem or similar). Emits the `chemicalData` event when the response comes back.

### getSaltCellConfig()

Requests salt cell status/configuration from the connected unit (requires an IntelliChlor or compatible salt cell). Emits the `saltCellConfig` event when the response comes back.

### getControllerConfig()

Requests controller configuration from the connected unit. Emits the `controllerConfig` event when the response comes back.

### setCircuitState(controllerId, circuitId, circuitState)

Activates or deactivates a circuit. See [`SLSetCircuitStateMessage`](#slsetcircuitstatemessage) documentation for argument values. Emits the `circuitStateChanged` event when response is acknowledged.

### setSetPoint(controllerId, bodyType, temperature)

Sets the heating setpoint for any body. See [`SLSetHeatSetPointMessage`](#slsetheatsetpointmessage) documentation for argument values. Emits the `setPointChanged` event when response is acknowledged.

### setHeatMode(controllerId, bodyType, heatMode)

Sets the preferred heat mode. See [`SLSetHeatModeMessage`](#slsetheatmodemessage) documentation for argument values. Emits the `heatModeChanged` event when response is acknowledged.

### sendLightCommand(controllerId, command)

Sends a lighting command. See [`SLLightControlMessage`](#sllightcontrolmessage) documentation for argument values. Emits the `sentLightCommand` event when response is acknowledged.

Note that better/more complete handling of lighting is desired, but I have yet to find all the commands I need to implement to make that happen. This currently sends each command to all lights and there is no ability to send to an individual light. Pull requests adding more functionality here would be most welcome.

### setSaltCellOutput(controllerId, poolOutput, spaOutput)

Sets the salt cell's output levels. See [`SLSetSaltCellConfigMessage`](#slsetsaltcellconfigmessage) documentation for argument values. Emits the `setSaltCellConfig` event when response is acknowledged.

### Events

* `loggedIn` - Indicates that a connection to the server has been established and the login process completed. `get` methods can be called once this event has been emitted.
* `version` - Indicates that a response to `getVersion()` has been received. Event handler receives a [`SLVersionMessage`](#slversionmessage) object.
* `poolStatus` - Indicates that a response to `getPoolStatus()` has been received. Event handler receives a [`SLPoolStatusMessage`](#slpoolstatusmessage) object.
* `chemicalData` - Indicates that a response to `getChemicalData()` has been received. Event handler receives a [`SLChemDataMessage`](#slchemdatamessage) object.
* `saltCellConfig` - Indicates that a response to `getSaltCellConfig()` has been received. Event handler receives a [`SLSaltCellConfigMessage`](#slsaltcellconfigmessage) object.
* `controllerConfig` - Indicates that a response to `getControllerConfig()` has been received. Event handler receives a [`SLControllerConfigMessage`](#slcontrollerconfigmessage) object.
* `circuitStateChanged` - Indicates that a response to `setCircuitState()` has been received. Event handler receives a [`SLSetCircuitStateMessage`](#slsetcircuitstatemessage) object.
* `setPointChanged` - Indicates that a response to `setSetPoint()` has been received. Event handler receives a [`SLSetHeatSetPointMessage`](#slsetheatsetpointmessage) object.
* `heatModeChanged` - Indicates that a response to `setHeatMode()` has been received. Event handler receives a [`SLSetHeatModeMessage`](#slsetheatmodemessage) object.
* `sentLightCommand` - Indicates that a response to `sendLightCommand()` has been received. Event handler receives a [`SLLightControlMessage`](#sllightcontrolmessage) object.
* `setSaltCellConfig` - Indicates that a response to `setSaltCellOutput()` has been received. Event handler receives a [`SLSetSaltCellConfigMessage`](#slsetsaltcellconfigmessage) object.
* `loginFailed` - Indicates that a remote login attempt via supplying a system address and password to `UnitConnection` has failed likely due to the incorrect password being used.
* `badParameter` - Indicates that a bad parameter has been supplied to a function. This can be triggered, for example, by sending the wrong controller ID to a `set` function.
* `error` - Indicates that an unhandled error was caught (such as the connection timing out)
* `addNewScheduleEvent` - will return a [`SLAddNewScheduleEvent`](#sladdnewscheduleevent) object. which contains the created `scheduleId` to be used later for setting up the properties
* `deleteScheduleById` - Indicates a response to the `deleteScheduleById()` command has been received.
* `getScheduleData` - will return a [`SLGetScheduleData`](#slgetscheduledata) object. which contains a list of events of the specified type
* `setScheduleEventById` - Indicates a response to the `setScheduleEventById()` command has been received.
* `setCircuitRuntimeById` - Indicates a response to the `setCircuitRuntimeById()` command has been received.

### Properties

* `address` - string representing the IPv4 address of the found server
* `type` - integer representing the type of server found (will always be 2)
* `port` - short representing the port to use for TCP connections to this server
* `gatewayType` - byte
* `gatewaySubtype` - byte
* `gatewayName` - string representing the server's name. Will be in the format Pentair: xx-xx-xx

## SLVersionMessage

Passed as an argument to the emitted `version` event handler.

### Properties

* `version` - a string representing the system's version

## SLPoolStatusMessage

Passed as an argument to the emitted `poolStatus` event handler.

### isDeviceReady()

Returns a bool indicating whether the device is in a normal operating state.

### isDeviceSync()

Returns a bool.

### isDeviceServiceMode()

Returns a bool indicating whether the device is in service mode or not.

### isSpaActive()

Returns a bool indicating whether the spa is currently active or not.

### isPoolActive()

Returns a bool indicating whether the pool is currently active or not.

### Properties

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
* `coolSetPoint` - array of size 0-2 holding the cooling set point for each body as an integer (pool: 0, spa: 1) (check controller config to see if it's in celsius or fahrenheit)
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

## SLChemDataMessage

Passed as an argument to the emitted `chemicalData` event handler.

### Properties

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

## SLSaltCellConfigMessage

Passed as an argument to the emitted `saltCellConfig` event handler.

### Properties

* `installed` - boolean indicating whether a salt cell is installed or not
* `status` - integer bitmask
* `level1` - integer indicating the output level of the salt cell for the pool. I believe this operates on a 0-100 scale
* `level2` - integer indicating the output level of the salt cell for the spa. I believe this operates on a 0-100 scale
* `salt` - integer indicating salt level in parts-per-million
* `flags` - integer bitmask
* `superChlorTimer` - integer

## SLSetSaltCellConfigMessage

Passed as an argument to the emitted `setSaltCellConfig` event. The passed version is empty, however, since the response is just an acknowledgement of receipt of the set command.

### Properties

* `controllerId` - integer indicating the ID of the controller to send this command to.
  * Note that while `SLControllerConfigMessage` includes a controllerId, this ID, in my experience, should always be 0.
* `poolOutput` - integer indicating the output level of the salt cell for the pool. I believe this operates on a 0-100 scale.
* `spaOutput` - integer indicating the output level of the salt cell for the spa. I believe this operates on a 0-100 scale.

## SLControllerConfigMessage

Passed as an argument to the emitted `controllerConfig` event handler.

### hasSolar()

Returns a bool indicating whether the system has solar present. (Helper method for interpreting the value in `equipFlags`.)

### hasSolarAsHeatpump()

Returns a bool indicating whether the system has a solar heatpump (UltraTemp, ThermalFlo) present. (Helper method for interpreting the value in `equipFlags`.)

### hasChlorinator()

Returns a bool indicating whether the system has a chlorinator present. (Helper method for interpreting the value in `equipFlags`.)

### hasCooling()

Returns a bool indicating whether the system has a cooler present. (Helper method for interpreting the value in `equipFlags`.)

### hasIntellichem()

Returns a bool indicating whether the system has an IntelliChem chemical management system present. (Helper method for interpreting the value in `equipFlags`.)

### Properties

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

## SLSetCircuitStateMessage

Passed as an argument to the emitted `circuitStateChanged` event. The passed version is empty, however, since the response is just an acknowledgement of receipt of the set command.

### Properties

* `controllerId` - integer indicating the ID of the controller to send this command to.
  * Note that while `SLControllerConfigMessage` includes a controllerId, this ID, in my experience, should always be 0.
* `circuitId` - integer indicating the ID of the circuit to set the state of.
  * This ID can be retrieved from `SLControllerConfigMessage`'s `bodyArray` property.
* `circuitState` - integer indicating whether to switch the circuit on (`1`) or off (`0`).

## SLSetHeatSetPointMessage

Passed as an argument to the emitted `setPointChanged` event. The passed version is empty, however, since the response is just an acknowledgement of receipt of the set command.

### Properties

* `controllerId` - integer indicating the ID of the controller to send this command to.
  * Note that while `SLControllerConfigMessage` includes a controllerId, this ID, in my experience, should always be 0.
* `bodyType` - integer indicating the type of body to set the setpoint of. The pool is body `0` and the spa is body `1`.
* `temperature` - integer indicating the desired setpoint. This is presumably in whatever units your system is set to (celsius or fahrenheit).

## SLSetHeatModeMessage

Passed as an argument to the emitted `heatModeChanged` event. The passed version is empty, however, since the response is just an acknowledgement of receipt of the set command.

### Properties

* `controllerId` - integer indicating the ID of the controller to send this command to.
  * Note that while `SLControllerConfigMessage` includes a controllerId, this ID, in my experience, should always be 0.
* `bodyType` - integer indicating the type of body to set the setpoint of. The pool is body `0` and the spa is body `1`.
* `heatMode` - integer indicating the desired heater mode. Valid values are: 0: "Off", 1: "Solar", 2 : "Solar Preferred", 3 : "Heat Pump", 4: "Don't Change"

## SLLightControlMessage

Passed as an argument to the emitted `sentLightCommand` event. The passed version is empty, however, since the response is just an acknowledgement of receipt of the light command.

### Properties

* `controllerId` - integer indicating the ID of the controller to send this command to.
  * Note that while `SLControllerConfigMessage` includes a controllerId, this ID, in my experience, should always be 0.
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

## SLGetGatewayDataMessage

Passed as an argument to the emitted `gatewayFound` event. Contains information about the remote unit's status and access properties.

### Properties

* `gatewayFound` - boolean indicating whether a unit was found
* `licenseOK` - boolean indicating if the license is valid (I've never seen this be false)
* `ipAddr` - string containing the ipv4 address to remotely connect to this unit
* `port` - number containing the port to connect to the unit
* `portOpen` - boolean indicating whether or not the port is open and able to be connected to
* `relayOn` - boolean indicating whether the relay is on (unsure what exactly this indicates; it's always been false in my tests)

## SLAddNewScheduleEvent

Adds a new event to the specified schedule type, either 0 for regular events or 1 for one-time events

### Properties

* `scheduleType` - 0 - indicates regular scheduled events, 1 - indicates a run-once event

## SLDeleteScheduleEventById

Deletes a scheduled event with specified id

### Properties

* `scheduleId` - the scheduleId of the schedule to be deleted

## SLGetScheduleData

Retrieves a list of schedule events of the specified type, either 0 for regular events or 1 for one-time events

### Properties

* `scheduleType` - 0 - indicates regular scheduled events, 1 - indicates a run-once event

## SLSetScheduleEventById

Configures an event with properties as described below

### Properties

* `scheduleId` - id of a schedule previously created, see [`SLAddNewScheduleEvent`](#sladdnewscheduleevent)
* `circuitId` - id of the circuit to which this event applies to
* `startTime` - the start time of the event, specified as minutes since midnight
	* example: 6:00am would be 360
	* example: 6:15am would be 375
* `stopTime` - the stop time of the event, specified as minutes since midnight, format is the same as startTime
* `dayMask`
	* 7-bit mask that determines which days the schedule is active for, MSB is always 0, valid numbers 1-127
* `flags`
	* bit 0 is the schedule type, if 0 then regular event, if 1 its a run-once
	* bit 1 indicates whether heat setPoint should be changed 
	* only valid values i've seen are 0,1,2,3
* `heatCmd` - integer indicating the desired heater mode. Valid values are: 0: "Off", 1: "Solar", 2 : "Solar Preferred", 3 : "Heat Pump", 4: "Don't Change"
* `heatSetPoint` - the temperature set point if heat is to be changed (ignored if bit 1 of flags is 0)

## SLSetCircuitRuntimeById

Configures default run-time of a circuit, usually referred to as the 'egg timer', this also applies to 'run-once' programs as this will set the length of the program

### Properties

* `circuitId` - id of the circuit to which this event applies to
* `runTime` - integer specifying the minutes of runTime