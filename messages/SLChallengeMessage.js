'use strict';

const SLMessage = require('./SLMessage.js').SLMessage;

const MSG_ID = 14;

exports.SLChallengeMessage = class SLChallengeMessage extends SLMessage {
  constructor() {
    super(0, MSG_ID);
  }

  static getResponseId() {
    return MSG_ID + 1;
  }
};
