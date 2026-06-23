'use strict';

const ScreenLogic = require('../dist/index');

// A ScreenLogic device must answer the broadcast for this to run; without one
// on the network the test skips itself rather than failing (and leaking the
// finder's UDP socket, which would otherwise keep the process alive).
const discoveryMs = 4000;

describe('Finder', function() {
  this.timeout(discoveryMs + 2000);

  it('finds a server', function(done) {
    const finder = new ScreenLogic.FindUnits();

    const skipTimer = setTimeout(() => {
      finder.close();
      this.skip();
    }, discoveryMs);

    finder.on('serverFound', () => {
      clearTimeout(skipTimer);
      finder.close();
      done();
    });

    finder.search();
  });
});
