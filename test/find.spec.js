'use strict';

const ScreenLogic = require('../dist/index');

// you'll need a ScreenLogic-enabled device on your network for this to succeed
describe('Finder', function() {
  it('finds a server', function(done) {
    let finder = new ScreenLogic.FindUnits();
    finder.on('serverFound', server => {
      finder.close();
      done();
    });
    finder.search();
  });
});
