const SLMessage = require('./SLMessage.js').SLMessage;

exports.SLChallengeMessage = class SLChallengeMessage extends SLMessage {
  constructor() {
    super(0, 14);
  }
}
