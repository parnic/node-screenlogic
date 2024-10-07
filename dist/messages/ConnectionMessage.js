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
(function (ConnectionMessage) {
    let ResponseIDs;
    (function (ResponseIDs) {
        ResponseIDs[ResponseIDs["LoginFailure"] = 13] = "LoginFailure";
        ResponseIDs[ResponseIDs["Challenge"] = 15] = "Challenge";
        ResponseIDs[ResponseIDs["Ping"] = 17] = "Ping";
        ResponseIDs[ResponseIDs["Login"] = 28] = "Login";
        ResponseIDs[ResponseIDs["UnknownCommand"] = 30] = "UnknownCommand";
        ResponseIDs[ResponseIDs["BadParameter"] = 31] = "BadParameter";
        ResponseIDs[ResponseIDs["Version"] = 8121] = "Version";
        ResponseIDs[ResponseIDs["AddClient"] = 12523] = "AddClient";
        ResponseIDs[ResponseIDs["RemoveClient"] = 12525] = "RemoveClient";
        ResponseIDs[ResponseIDs["GatewayResponse"] = 18004] = "GatewayResponse";
    })(ResponseIDs = ConnectionMessage.ResponseIDs || (ConnectionMessage.ResponseIDs = {}));
})(ConnectionMessage = exports.ConnectionMessage || (exports.ConnectionMessage = {}));
//# sourceMappingURL=ConnectionMessage.js.map