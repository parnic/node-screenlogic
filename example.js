const ScreenLogic = require('./index');

var finder = new ScreenLogic.FindUnits();
finder.on('serverFound', function(server) {
  finder.close();
  connect(new ScreenLogic.UnitConnection(server));
});

finder.search();

// use this instead of the above `finder` logic if you want to use a direct connection
//connect(new ScreenLogic.UnitConnection(80, '10.0.0.85'));

function connect(client) {
  client.on('loggedIn', function() {
    this.getVersion();
  }).on('version', function(version) {
    this.getPoolStatus();
    console.log(" version=" + version.version);
  }).on('poolStatus', function(status) {
    this.getChemicalData();
    console.log(" pool ok=" + status.ok);
    console.log(" air temp=" + status.airTemp);
    console.log(" salt ppm=" + status.saltPPM);
    console.log(" pH=" + status.pH);
    console.log(" saturation=" + status.saturation);
    console.log(" spa active=" + status.isSpaActive());
    console.log(" pool active=" + status.isPoolActive());
  }).on('chemicalData', function(chemData) {
    this.getSaltCellConfig();
    console.log(" calcium=" + chemData.calcium);
    console.log(" cyanuric acid=" + chemData.cyanuricAcid);
    console.log(" alkalinity=" + chemData.alkalinity);
  }).on('saltCellConfig', function(saltCellConfig) {
    this.getControllerConfig();
    console.log(" salt cell installed=" + saltCellConfig.installed);
  }).on('controllerConfig', function(config) {
    console.log(" controller is in celsius=" + config.degC);
    client.close();
  });

  client.connect();
}
