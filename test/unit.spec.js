'use strict';

const ScreenLogic = require('../index');

// you'll need a ScreenLogic-enabled device on your network for this to succeed
describe('Unit', () => {
  let unit;
  before(done => {
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

  after(() => {
    unit.close();
  });

  // let circuit;
  it('gets pool status', done => {
    unit.on('poolStatus', status => {
      /* circuit = */status.circuitArray[0];
      done();
    });

    unit.getPoolStatus();
  });

  it('gets controller config', done => {
    unit.on('controllerConfig', config => {
      done();
    });
    unit.getControllerConfig();
  });

  it('gets chemical data', done => {
    unit.on('chemicalData', () => {
      done();
    });
    unit.getChemicalData();
  });

  it('gets salt cell config', done => {
    unit.on('saltCellConfig', () => {
      done();
    });
    unit.getSaltCellConfig();
  });

  it('gets version', done => {
    unit.on('version', () => {
      done();
    });
    unit.getVersion();
  });

  /* uncomment this and the `circuit` stuff above to test setting state
  it('sets circuit state', done => {
    unit.on('circuitStateChanged', () => {
      done();
    });
    unit.setCircuitState(0, circuit.id, circuit.state);
  });
  */
});
