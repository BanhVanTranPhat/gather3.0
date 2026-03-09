"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kickPlayer = kickPlayer;
const session_1 = require("../session");
const __1 = require("..");
function kickPlayer(uid, reason) {
    const session = session_1.sessionManager.getPlayerSession(uid);
    const room = session.getPlayerRoom(uid);
    const players = session.getPlayersInRoom(room);
    for (const player of players) {
        if (player.uid === uid) {
            __1.io.to(player.socketId).emit('kicked', reason);
        }
        else {
            __1.io.to(player.socketId).emit('playerLeftRoom', uid);
        }
    }
    const player = session.getPlayer(uid);
    __1.io.sockets.sockets.get(player.socketId)?.leave(session.id);
    // player is already in session, kick them
    session_1.sessionManager.logOutPlayer(uid);
}
