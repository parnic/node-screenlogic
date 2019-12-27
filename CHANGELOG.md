# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
