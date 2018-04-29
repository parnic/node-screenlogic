'use strict';

const ScreenLogic = require('../index');

// you'll need a ScreenLogic-enabled device on your network for this to succeed
describe('Finder', () => {
  it('finds a server', done => {
    let finder = new ScreenLogic.FindUnits();
    finder.on('serverFound', server => {
      finder.close();
      done();
    });
    finder.search();
  });
});
