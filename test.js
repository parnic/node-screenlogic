const ScreenLogic = require('./index');

var finder = new ScreenLogic.FindUnits();
finder.on('serverFound', function(server) {
  var client = new ScreenLogic.UnitConnection(server);
  client.on('loggedIn', function() {
    this.getPoolStatus();
    this.getControllerConfig();
  }).on('poolStatus', function(status) {
  }).on('controllerConfig', function(config) {
    client.close();
    finder.close();
  });

  client.connect();
});

finder.search();
