const ScreenLogic = require('./index');

var finder = new ScreenLogic.FindUnits();
finder.on('serverFound', function(server) {
  var client = new ScreenLogic.UnitConnection(server);
  client.on('loggedIn', function() {
    this.getPoolStatus();
    this.getControllerConfig();
  }).on('poolStatus', function(status) {
    console.log(" pool ok=" + status.ok);
    console.log(" air temp=" + status.airTemp);
    console.log(" salt ppm=" + status.saltPPM * 50);
    console.log(" pH=" + status.pH / 100);
  }).on('controllerConfig', function(config) {
    console.log(" controller is in celsius=" + config.degC);
    client.close();
    finder.close();
  });

  client.connect();
});

finder.search();
