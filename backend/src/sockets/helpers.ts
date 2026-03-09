import { sessionManager } from '../session'
import { io } from '..'

export function kickPlayer(uid: string, reason: string) {
    const session = sessionManager.getPlayerSession(uid)
    if (!session) return

    const player = session.getPlayer(uid)
    if (!player) return

    const room = session.getPlayerRoom(uid)
    const players = session.getPlayersInRoom(room)

    for (const p of players) {
        if (p.uid === uid) {
            io.to(p.socketId).emit('kicked', reason)
        } else {
            io.to(p.socketId).emit('playerLeftRoom', uid)
        }
    }

    const oldSocketId = player.socketId
    const oldSocket = io.sockets.sockets.get(oldSocketId)
    if (oldSocket) {
        oldSocket.leave(session.id)
        oldSocket.disconnect(true)
    }

    sessionManager.logOutPlayer(uid)
}