"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionMessage = void 0;
class ConnectionMessage {
    static decodeChallengeResponse(msg) {
        const challengeString = msg.readSLString();
        return challengeString;
    }
    static decodeVersionResponse(msg) {
        const version = msg.readSLString();
        const versionData = {
            senderId: msg.senderId,
            version
        };
        return versionData;
    }
    static decodeAddClient(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
    static decodeRemoveClient(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
    static decodePingClient(msg) {
        // ack
        const response = {
            senderId: msg.senderId,
            val: true
        };
        return response;
    }
}
exports.ConnectionMessage = ConnectionMessage;
//# sourceMappingURL=ConnectionMessage.js.map