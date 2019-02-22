'use strict';

const ScreenLogic = require('./index');

// use this to find and connect to units local to the network this is running on
// var finder = new ScreenLogic.FindUnits();
// finder.on('serverFound', function(server) {
//  finder.close();
//  connect(new ScreenLogic.UnitConnection(server));
// });
//
// finder.search();

// use this if you want to use a direct connection to a known unit
// connect(new ScreenLogic.UnitConnection(80, '10.0.0.85'));

// use this to remote connect to a system by name (going through the Pentair servers)
const systemName = 'Pentair: xx-xx-xx';
const password = '1234';

var remote = new ScreenLogic.RemoteLogin(systemName);
remote.on('gatewayFound', function(unit) {
  remote.close();
  if (unit && unit.gatewayFound) {
    console.log('unit ' + remote.systemName + ' found at ' + unit.ipAddr + ':' + unit.port);
    connect(new ScreenLogic.UnitConnection(unit.port, unit.ipAddr, password));
  } else {
    console.log('no unit found by that name');
  }
});

remote.connect();

// generic connection method used by all above examples
function connect(client) {
  client.on('loggedIn', function() {
    this.getVersion();
  }).on('version', function(version) {
    this.getPoolStatus();
    console.log(' version=' + version.version);
  }).on('poolStatus', function(status) {
    this.getChemicalData();
    console.log(' pool ok=' + status.ok);
    console.log(' pool temp=' + status.currentTemp[0]);
    console.log(' air temp=' + status.airTemp);
    console.log(' salt ppm=' + status.saltPPM);
    console.log(' pH=' + status.pH);
    console.log(' saturation=' + status.saturation);
    console.log(' spa active=' + status.isSpaActive());
    console.log(' pool active=' + status.isPoolActive());
  }).on('chemicalData', function(chemData) {
    this.getSaltCellConfig();
    console.log(' calcium=' + chemData.calcium);
    console.log(' cyanuric acid=' + chemData.cyanuricAcid);
    console.log(' alkalinity=' + chemData.alkalinity);
  }).on('saltCellConfig', function(saltCellConfig) {
    this.getControllerConfig();
    console.log(' salt cell installed=' + saltCellConfig.installed);
  }).on('controllerConfig', function(config) {
    console.log(' controller is in celsius=' + config.degC);
    client.close();
  }).on('loginFailed', function() {
    console.log(' unable to login (wrong password?)');
    client.close();
  });

  client.connect();
}
