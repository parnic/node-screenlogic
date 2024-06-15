# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Fixed

* Fixed bodies.setHeatModeAsync incorrectly subtracting one from the given body index. This is a breaking change if you were correcting for the offset already.

## v2.0.0 - 2023-03-10

This major version number increase comes with many changes under the hood, including a rename of most every method in the library. This adds Promises and Typescript support. See the [Migration guide](https://github.com/parnic/node-screenlogic/wiki/Migration-guide) and [Breaking changes](https://github.com/parnic/node-screenlogic/wiki/Breaking-changes) wiki pages for detailed information.

## v1.10.1 - 2022-05-31

### Added

* Added simple "ping" message as a lightweight way to keep the connection alive for a user using the addClient() api.

### Fixed

* Fixed Date parsing from ScreenLogic packets returning the wrong date under specific conditions (such as the last day of the month or during specific hours when javascript month/day assignment order can change other parts of the date).

### Changed

* Improved FindUnits.search() to support being called multiple times. This function issues one UDP broadcast per call, so consumer applications may need to run it in a delayed loop if no units are found on the first request (e.g. when the device running the search or the pool equipment is temporarily disconnected from the network). This is a stateless UDP query, so client applications cannot rely on the error or close events to issue retries.

## v1.10.0 - 2022-05-23

### Added

* Added capturing of weather forecast events so that we're not treating it as an unknown message. This also includes full handling for getting weather forecasts from the equipment, but in my experience it's either outdated or not as thorough/reliable as we could get from pretty much any other source, so it remains undocumented for now.
* Added handling of asynchronous chemicalData messages. These are received periodically through the addClient() data push feature.

### Fixed

* Fixed an ugly problem where the library could hang and fail to hand off any more messages if multiple messages were received at the same time (which I've seen happen on lower powered hardware like a Raspberry Pi). This would also cause the internal data buffer to grow unbounded as long as the UnitConnection stayed alive.

## v1.9.1 - 2022-05-20

### Added

* Added `close` event to FindUnits, RemoteLogin, and UnitConnection for when the connection to the endpoint has closed.

## v1.9.0 - 2022-05-20

### Added

* Added support for getting system chemical history data. This includes pH and ORP readings over time as well as pH and ORP feed on/off times.

## v1.8.0 - 2022-04-17

### Added

* Added support for reading ScreenLogic time packets.
* Added support for getting system history data. This includes temperature readings over time as well as circuit on/off changes over time.

### Fixed

* Updated dependencies to safer versions of some packages.
* Fixed day-of-week conversion from Javascript Date objects to ScreenLogic times (SLTimes are 1-based starting on Sunday).

### Changed

* Alphabetized the readme.

## v1.7.0 - 2021-10-13

### Added

* Added handling/documentation for the scheduleChanged event (#44).
* Added support for getting and setting the system date/time.

### Fixed

* Documentation updates for `SLGetScheduleData`, more linkage for easy navigation, `addClient`/`removeClient` methods, clarified `coolSetPoint` for spas.

## v1.6.1 - 2020-11-23

### Added

* Every call now can optionally specify an ID that will be returned with the result, allowing tracking of simultaneous commands.

## v1.6.0 - 2020-07-14

### Added

* Fleshed out the still-undocumented `SLEquipmentConfigurationMessage` with a few more helper methods for interpreting the data inside.
* Helper method for getting a circuit from its device ID on an `SLControllerConfigMessage`.
* Support for getting the status of pumps and setting flow speeds per-pump-per-circuit.
* Constants for interpreting heat command/mode properties on various messages:
  * ScreenLogic.HEAT_MODE_OFF
  * ScreenLogic.HEAT_MODE_SOLAR
  * ScreenLogic.HEAT_MODE_SOLARPREFERRED
  * ScreenLogic.HEAT_MODE_HEATPUMP
  * ScreenLogic.HEAT_MODE_DONTCHANGE
* Debug logs using the "debug" NPM package. You'll need to run an `npm install` after updating to this version.
* Ability to cancel delays in pool equipment. #20 - thanks @bshep
* Ability to register for push messages from the equipment so the connection can be kept open instead of repeatedly reconnecting and polling for changes. See the `addClient()` and `removeClient()` functions on the `UnitConnection` docs. Thanks @bshep

## v1.5.0 - 2020-06-06

### Added

* Added support for adding, deleting, listing, and updating scheduled events - thanks @bshep
* Added egg timer support - thanks @bshep

## v1.4.0 - 2020-05-25

### Added

* Support for controlling the salt cell generator's output levels.
* Helper methods for interpreting `controllerType`.
* Experimental support for an Equipment Configuration message (not documented as of yet - `SLEquipmentConfigurationMessage` / `getEquipmentConfiguration()`). This message returns arrays of various information about the equipment, but I don't know how to interpret the information in those arrays yet. Any assistance with decoding this information would be hugely helpful.
* `error` handler on all objects for reacting to unhandled node errors - thanks @schemers

### Fixed

* VSCode "Example" configuration can now be launched on non-Windows platforms.

### Changed

* Minor memory/performance optimizations.
* Running tests no longer changes any state of any pool equipment.

## v1.3.1 - 2019-12-27

### Added

* Several methods added to SLControllerConfigMessage for interpreting the equipFlags value.

### Fixed

* server.gatewayName no longer cuts off the last character of the name. #14 - thanks @mikemucc

## v1.3.0 - 2019-11-26

### Added

* Ability to set heat setpoint.
* Ability to set heat mode.
* Event for supplying incorrect parameters to `set` functions.
* Ability to send limited selection of light commands.

## v1.2.1 - 2019-03-26

### Fixed

* Messages larger than 1024 bytes are now handled properly.

## v1.2.0 - 2019-02-22

### Added

* Remote connection through Pentair servers
* Connecting to password-protected systems (this is only enforced by the ScreenLogic system on remote connections)

## v1.1.0 - 2018-04-23

### Added

* Ability to set circuit state.

### Fixed

* FindUnits.sendServerBroadcast() was failing in certain environments.

## v1.0.1 - 2018-03-31

### Added

* Direct connection support.

## v1.0.0 - 2018-03-31

* Initial release
