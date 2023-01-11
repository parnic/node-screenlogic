"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionMessage = void 0;
class ConnectionMessage {
    static decodeChallengeResponse(msg) {
        let challengeString = msg.readSLString();
        return challengeString;
    }
    static decodeVersionResponse(msg) {
        let version = msg.readSLString();
        return version;
    }
    static decodeAddClient(msg) {
        // ack
        return true;
    }
    static decodeRemoveClient(msg) {
        // ack
        return true;
    }
    static decodePingClient(msg) {
        // ack
        return true;
    }
}
exports.ConnectionMessage = ConnectionMessage;
//# sourceMappingURL=ConnectionMessage.js.map