"use strict";
exports.__esModule = true;
exports.ConnectionMessage = void 0;
var ConnectionMessage = /** @class */ (function () {
    function ConnectionMessage() {
    }
    ConnectionMessage.decodeChallengeResponse = function (msg) {
        var challengeString = msg.readSLString();
        return challengeString;
    };
    ConnectionMessage.decodeVersionResponse = function (msg) {
        var version = msg.readSLString();
        return version;
    };
    ConnectionMessage.decodeAddClient = function (msg) {
        // ack
        return true;
    };
    ConnectionMessage.decodeRemoveClient = function (msg) {
        // ack
        return true;
    };
    ConnectionMessage.decodePingClient = function (msg) {
        // ack
        return true;
    };
    return ConnectionMessage;
}());
exports.ConnectionMessage = ConnectionMessage;
