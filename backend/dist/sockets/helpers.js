"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kickPlayer = kickPlayer;
const session_1 = require("../session");
const __1 = require("..");
function kickPlayer(uid, reason) {
    const session = session_1.sessionManager.getPlayerSession(uid);
    if (!session)
        return;
    const player = session.getPlayer(uid);
    if (!player)
        return;
    const room = session.getPlayerRoom(uid);
    const players = session.getPlayersInRoom(room);
    for (const p of players) {
        if (p.uid === uid) {
            __1.io.to(p.socketId).emit('kicked', reason);
        }
        else {
            __1.io.to(p.socketId).emit('playerLeftRoom', uid);
        }
    }
    const oldSocketId = player.socketId;
    // Remove from session BEFORE disconnecting socket to prevent the
    // disconnect handler from firing and removing the user from the users store
    session_1.sessionManager.logOutPlayer(uid);
    const oldSocket = __1.io.sockets.sockets.get(oldSocketId);
    if (oldSocket) {
        oldSocket.leave(session.id);
        oldSocket.disconnect(true);
    }
}
