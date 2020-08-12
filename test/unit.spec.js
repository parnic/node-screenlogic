'use strict';

const ScreenLogic = require('../index');
var assert = require('assert');

// you'll need a ScreenLogic-enabled device on your network for this to succeed
describe('Unit', function() {
  let unit;
  before(function(done) {
    let finder = new ScreenLogic.FindUnits();
    finder.on('serverFound', server => {
      finder.close();

      unit = new ScreenLogic.UnitConnection(server);
      unit.on('loggedIn', () => {
        done();
      });

      unit.connect();
    });

    finder.search();
  });

  after(function() {
    unit.close();
  });

  it('gets pool status', function(done) {
    unit.on('poolStatus', status => {
      assert.equal(status.senderId, 0);
      done();
    });

    unit.getPoolStatus();
  });

  it('gets controller config', function(done) {
    unit.on('controllerConfig', config => {
      assert.equal(config.senderId, 42);
      done();
    });

    unit.getControllerConfig(42);
  });

  it('gets chemical data', function(done) {
    unit.on('chemicalData', chemData => {
      assert.equal(chemData.senderId, 123);
      done();
    });

    unit.getChemicalData(123);
  });

  it('gets salt cell config', function(done) {
    unit.on('saltCellConfig', saltConfig => {
      assert.equal(saltConfig.senderId, 0);
      done();
    });

    unit.getSaltCellConfig();
  });

  it('gets version', function(done) {
    unit.on('version', version => {
      assert.equal(version.senderId, 41239);
      done();
    });

    unit.getVersion(41239);
  });

  /* uncomment this and the `circuit` stuff above to test setting state
  it('sets circuit state', function(done) {
    unit.on('circuitStateChanged', () => {
      done();
    });
    unit.setCircuitState(0, circuit.id, circuit.state);
  });
  */
});
