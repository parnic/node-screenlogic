'use strict';

const SLMessage = require('../messages/SLMessage.js').SLMessage;
const assert = require('assert');

function slMessageLen(str) {
  // strings have length prefixed on them as an int32 for an additional 4b.
  // strings are dword aligned, so if str.length is 21, dword alignment pushes it up to 24
  return 4 + str.length + SLMessage.slackForAlignment(str.length);
}

describe('SLMessage utilities', function() {
  // message header = senderId, messageId, bodyLen.
  // senderId and messageId are int16's, so 2b each. bodyLen is an int32, so 4b. total 8b.
  let msgHeaderLen = 8;

  it('sets senderId and messageId properly', function() {
    {
      let msg = new SLMessage(123, 456);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.strictEqual(decodedMsg.senderId, 123);
      assert.strictEqual(decodedMsg.messageId, 456);
      assert.strictEqual(decodedMsg.dataLength, 0);
    }

    {
      let msg = new SLMessage(0, 65534);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.strictEqual(decodedMsg.senderId, 0);
      assert.strictEqual(decodedMsg.messageId, 65534);
      assert.strictEqual(decodedMsg.dataLength, 0);
    }

    {
      let msg = new SLMessage();
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.strictEqual(decodedMsg.senderId, 0);
      assert.strictEqual(decodedMsg.messageId, 0);
      assert.strictEqual(decodedMsg.dataLength, 0);
    }

    {
      let msg = new SLMessage(123);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.strictEqual(decodedMsg.senderId, 123);
      assert.strictEqual(decodedMsg.messageId, 0);
      assert.strictEqual(decodedMsg.dataLength, 0);
    }

    {
      let msg = new SLMessage(0);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.strictEqual(decodedMsg.senderId, 0);
      assert.strictEqual(decodedMsg.messageId, 0);
      assert.strictEqual(decodedMsg.dataLength, 0);
    }
  });

  it('encodes and decodes SLStrings', function() {
    {
      let msg = new SLMessage();
      let testStr = 'this is a test string';
      msg.writeSLString(testStr);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.strictEqual(decodedMsg.readSLString(), testStr, 'did not receive serialized message properly');
      assert.strictEqual(SLMessage.slackForAlignment(testStr.length), 3);
      // SLString byte length = 4 + 21 + 3 = 28b
      assert.strictEqual(slMessageLen(testStr),
        4 + testStr.length + SLMessage.slackForAlignment(testStr.length));
      assert.strictEqual(decodedMsg.readOffset, msgHeaderLen + slMessageLen(testStr), 'read offset was invalid');
      assert.strictEqual(decodedMsg.dataLength, decodedMsg.readOffset - 8);
    }

    {
      let msg = new SLMessage();
      let testStr = '1';
      msg.writeSLString(testStr);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.strictEqual(decodedMsg.readSLString(), testStr, 'did not receive serialized message properly');
      assert.strictEqual(SLMessage.slackForAlignment(testStr.length), 3);
      assert.strictEqual(decodedMsg.readOffset, msgHeaderLen + slMessageLen(testStr), 'read offset was invalid');
      assert.strictEqual(decodedMsg.dataLength, decodedMsg.readOffset - 8);
    }

    {
      let msg = new SLMessage();
      let testStr = '12';
      msg.writeSLString(testStr);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.strictEqual(decodedMsg.readSLString(), testStr, 'did not receive serialized message properly');
      assert.strictEqual(SLMessage.slackForAlignment(testStr.length), 2);
      assert.strictEqual(decodedMsg.readOffset, msgHeaderLen + slMessageLen(testStr), 'read offset was invalid');
      assert.strictEqual(decodedMsg.dataLength, decodedMsg.readOffset - 8);
    }

    {
      let msg = new SLMessage();
      let testStr = '123';
      msg.writeSLString(testStr);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.strictEqual(decodedMsg.readSLString(), testStr, 'did not receive serialized message properly');
      assert.strictEqual(SLMessage.slackForAlignment(testStr.length), 1);
      assert.strictEqual(decodedMsg.readOffset, msgHeaderLen + slMessageLen(testStr), 'read offset was invalid');
      assert.strictEqual(decodedMsg.dataLength, decodedMsg.readOffset - 8);
    }

    {
      let msg = new SLMessage();
      let testStr = '1234';
      msg.writeSLString(testStr);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.strictEqual(decodedMsg.readSLString(), testStr, 'did not receive serialized message properly');
      assert.strictEqual(SLMessage.slackForAlignment(testStr.length), 0);
      assert.strictEqual(decodedMsg.readOffset, msgHeaderLen + slMessageLen(testStr), 'read offset was invalid');
      assert.strictEqual(decodedMsg.dataLength, decodedMsg.readOffset - 8);
    }
  });

  it('encodes and decodes SLArrays', function() {
    {
      let msg = new SLMessage();
      let list = [];
      msg.writeSLArray(list);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.deepStrictEqual(decodedMsg.readSLArray(), list);
      assert.strictEqual(SLMessage.slackForAlignment(list.length), 0);
      assert.strictEqual(decodedMsg.readOffset, msgHeaderLen + slMessageLen(list), 'read offset was invalid');
      assert.strictEqual(decodedMsg.dataLength, decodedMsg.readOffset - 8);
    }

    {
      let msg = new SLMessage();
      let list = [1];
      msg.writeSLArray(list);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.deepStrictEqual(decodedMsg.readSLArray(), list);
      assert.strictEqual(SLMessage.slackForAlignment(list.length), 3);
      assert.strictEqual(decodedMsg.readOffset, msgHeaderLen + slMessageLen(list), 'read offset was invalid');
      assert.strictEqual(decodedMsg.dataLength, decodedMsg.readOffset - 8);
    }

    {
      let msg = new SLMessage();
      let list = [1, 2];
      msg.writeSLArray(list);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.deepStrictEqual(decodedMsg.readSLArray(), list);
      assert.strictEqual(SLMessage.slackForAlignment(list.length), 2);
      assert.strictEqual(decodedMsg.readOffset, msgHeaderLen + slMessageLen(list), 'read offset was invalid');
      assert.strictEqual(decodedMsg.dataLength, decodedMsg.readOffset - 8);
    }

    {
      let msg = new SLMessage();
      let list = [1, 2, 3];
      msg.writeSLArray(list);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.deepStrictEqual(decodedMsg.readSLArray(), list);
      assert.strictEqual(SLMessage.slackForAlignment(list.length), 1);
      assert.strictEqual(decodedMsg.readOffset, msgHeaderLen + slMessageLen(list), 'read offset was invalid');
      assert.strictEqual(decodedMsg.dataLength, decodedMsg.readOffset - 8);
    }

    {
      let msg = new SLMessage();
      let list = [1, 2, 3, 4];
      msg.writeSLArray(list);
      let decodedMsg = new SLMessage(msg.toBuffer());
      assert.deepStrictEqual(decodedMsg.readSLArray(), list);
      assert.strictEqual(SLMessage.slackForAlignment(list.length), 0);
      assert.strictEqual(decodedMsg.readOffset, msgHeaderLen + slMessageLen(list), 'read offset was invalid');
      assert.strictEqual(decodedMsg.dataLength, decodedMsg.readOffset - 8);
    }
  });

  it('encodes Date as SLTime', function() {
    let msg = new SLMessage();
    let date = new Date(2021, 8, 6, 22, 8, 5);
    msg.writeSLDateTime(date);
    let decodedMsg = new SLMessage(msg.toBuffer());
    assert.equal(decodedMsg.readUInt16LE(), 2021);
    // javascript Date() month is 0-based, ScreenLogic month matches the calendar
    assert.equal(decodedMsg.readUInt16LE(), 9);
    // ScreenLogic day-of-week starts with Monday as 0
    assert.equal(decodedMsg.readUInt16LE(), 0);
    assert.equal(decodedMsg.readUInt16LE(), 6);
    assert.equal(decodedMsg.readUInt16LE(), 22);
    assert.equal(decodedMsg.readUInt16LE(), 8);
    assert.equal(decodedMsg.readUInt16LE(), 5);
    assert.equal(decodedMsg.readUInt16LE(), 0);
  });

  it('decodes SLTime as Date', function() {
    let msg = new SLMessage();
    let date = new Date(2021, 8, 6, 22, 8, 5);
    msg.writeSLDateTime(date);
    let decodedMsg = new SLMessage(msg.toBuffer());
    let decodedDate = decodedMsg.readSLDateTime();
    assert.equal(date.getFullYear(), decodedDate.getFullYear());
    assert.equal(date.getMonth(), decodedDate.getMonth());
    assert.equal(date.getDate(), decodedDate.getDate());
    assert.equal(date.getHours(), decodedDate.getHours());
    assert.equal(date.getMinutes(), decodedDate.getMinutes());
    assert.equal(date.getSeconds(), decodedDate.getSeconds());
    assert.equal(date.getMilliseconds(), decodedDate.getMilliseconds());
  });
});
