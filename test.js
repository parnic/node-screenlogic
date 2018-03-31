const ScreenLogic = require('./index');

var finder = new ScreenLogic.FindUnits();
finder.on('serverFound', function(server) {
  var client = new ScreenLogic.UnitConnection(server);
  client.on('loggedIn', function() {
    this.getVersion();
    this.getPoolStatus();
    this.getChemicalData();
    this.getSaltCellConfig();
    this.getControllerConfig();
  }).on('poolStatus', function(status) {
    console.log(" pool ok=" + status.ok);
    console.log(" air temp=" + status.airTemp);
    console.log(" salt ppm=" + status.saltPPM);
    console.log(" pH=" + status.pH);
    console.log(" saturation=" + status.saturation);
    console.log(" spa active=" + status.isSpaActive());
    console.log(" pool active=" + status.isPoolActive());
  }).on('controllerConfig', function(config) {
    console.log(" controller is in celsius=" + config.degC);
    client.close();
    finder.close();
  }).on('chemicalData', function(chemData) {
    console.log(" calcium=" + chemData.calcium);
    console.log(" cyanuric acid=" + chemData.cyanuricAcid);
    console.log(" alkalinity=" + chemData.alkalinity);
  }).on('saltCellConfig', function(saltCellConfig) {
    console.log(" salt cell installed=" + saltCellConfig.installed);
  }).on('version', function(version) {
    console.log(" version=" + version.version);
  });

  client.connect();
});

finder.search();
