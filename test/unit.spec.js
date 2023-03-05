'use strict';

const ScreenLogic = require('../dist/index');
var assert = require('assert');

// you'll need a ScreenLogic-enabled device on your network for this to succeed
describe('Unit', function() {
  let unit = ScreenLogic.screenlogic;
  before(function(done) {
    let finder = new ScreenLogic.FindUnits();
    finder.on('serverFound', async server => {
      finder.close();

      unit.initUnit(server);
      unit.once('loggedIn', () => {
        done();
      });

      try {
        if (!await unit.connectAsync()) {
          console.error('failed connection');
        }
      } catch(err) {
        console.error(`caught error trying to connect: ${err}`);
        done(err);
      }
    });

    finder.search();
  });

  after(async function() {
    await unit.closeAsync();
  });

  it('gets pool status', function(done) {
    unit.once('equipmentState', status => {
      assert.equal(status.senderId, 0);
      done();
    });

    unit.equipment.getEquipmentStateAsync();
  });

  it('gets controller config', function(done) {
    unit.once('controllerConfig', config => {
      assert.equal(config.senderId, 42);
      done();
    });

    unit.equipment.getControllerConfigAsync(42);
  });

  it('gets chemical data', function(done) {
    unit.once('chemicalData', chemData => {
      assert.equal(chemData.senderId, 123);
      done();
    });

    unit.chem.getChemicalDataAsync(123);
  });

  it('gets salt cell config', function(done) {
    unit.once('intellichlorConfig', saltConfig => {
      assert.equal(saltConfig.senderId, 0);
      done();
    });

    unit.chlor.getIntellichlorConfigAsync();
  });

  it('gets version', function(done) {
    unit.once('version', version => {
      assert.equal(version.senderId, 41239);
      done();
    });

    unit.getVersionAsync(41239);
  });

  it('can add and remove a client', function(done) {
    unit.once('addClient', response => {
      assert.equal(response.senderId, 4321);
      unit.removeClientAsync(5432);
    }).once('removeClient', response => {
      assert.equal(response.senderId, 5432);
      done();
    });

    unit.addClientAsync(1234, 4321);
  });

  it('can add and remove a client with async/await', async function() {
    const addClientResponse = await unit.addClientAsync(1234, 4321);
    assert.equal(addClientResponse.senderId, 4321);
    const removeClientResponse = await unit.removeClientAsync(5432);
    assert.equal(removeClientResponse.senderId, 5432);
  });

  it('can ping the server', async () => {
    const pong = await unit.pingServerAsync(1122);
    assert.equal(pong.senderId, 1122);
  });

  /* uncomment this and the `circuit` stuff above to test setting state
  it('sets circuit state', function(done) {
    unit.once('circuitStateChanged', () => {
      done();
    });
    unit.setCircuitState(0, circuit.id, circuit.state);
  });
  */
});
