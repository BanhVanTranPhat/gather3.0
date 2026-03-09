"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sockets = sockets;
const socket_types_1 = require("./socket-types");
const auth_1 = require("../auth");
const realmService_1 = require("../realmService");
const Users_1 = require("../Users");
const session_1 = require("../session");
const utils_1 = require("../utils");
const helpers_1 = require("./helpers");
const utils_2 = require("../utils");
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
const joiningInProgress = new Set();
// Lobby chat (trang /chat) — in-memory, tối đa 100 tin
const LOBBY_MAX = 100;
const lobbyMessages = [];
const lobbyUsers = {};
let lobbyIdCounter = 0;
function protectConnection(io) {
    io.use(async (socket, next) => {
        const access_token = socket.handshake.headers['authorization']?.split(' ')[1];
        const uid = socket.handshake.query.uid;
        if (!access_token || !uid) {
            const error = new Error("Invalid access token or uid.");
            return next(error);
        }
        const user = (0, auth_1.verifyToken)(access_token);
        if (!user || user.id !== uid) {
            return next(new Error("Invalid access token or uid."));
        }
        Users_1.users.addUser(uid, user);
        next();
    });
}
function sockets(io) {
    protectConnection(io);
    // Handle a connection
    io.on('connection', (socket) => {
        function on(eventName, schema, callback) {
            socket.on(eventName, (data) => {
                const success = schema.safeParse(data).success;
                if (!success)
                    return;
                const session = session_1.sessionManager.getPlayerSession(socket.handshake.query.uid);
                if (!session) {
                    return;
                }
                callback({ session, data });
            });
        }
        function emit(eventName, data) {
            const session = session_1.sessionManager.getPlayerSession(socket.handshake.query.uid);
            if (!session) {
                return;
            }
            const room = session.getPlayerRoom(socket.handshake.query.uid);
            const players = session.getPlayersInRoom(room);
            for (const player of players) {
                if (player.socketId === socket.id)
                    continue;
                io.to(player.socketId).emit(eventName, data);
            }
        }
        function emitToSocketIds(socketIds, eventName, data) {
            for (const socketId of socketIds) {
                io.to(socketId).emit(eventName, data);
            }
        }
        socket.on('joinRealm', async (realmData) => {
            const uid = socket.handshake.query.uid;
            const rejectJoin = (reason) => {
                socket.emit('failedToJoinRoom', reason);
                joiningInProgress.delete(uid);
            };
            if (socket_types_1.JoinRealm.safeParse(realmData).success === false) {
                return rejectJoin('Invalid request data.');
            }
            if (joiningInProgress.has(uid)) {
                rejectJoin('Already joining a space.');
            }
            joiningInProgress.add(uid);
            const session = session_1.sessionManager.getSession(realmData.realmId);
            if (session) {
                const playerCount = session.getPlayerCount();
                if (playerCount >= 30) {
                    return rejectJoin("Space is full. It's 30 players max.");
                }
            }
            const realm = await (0, realmService_1.getRealmById)(realmData.realmId);
            if (!realm) {
                return rejectJoin('Space not found.');
            }
            const profile = await (0, realmService_1.getProfileById)(uid);
            if (!profile) {
                return rejectJoin('Failed to get profile.');
            }
            const data = realm;
            const join = async () => {
                const mapData = data.map_data != null ? data.map_data : {
                    spawnpoint: { roomIndex: 0, x: 0, y: 0 },
                    rooms: [{ name: 'New Room', tilemap: {} }],
                };
                if (!session_1.sessionManager.getSession(realmData.realmId)) {
                    session_1.sessionManager.createSession(realmData.realmId, mapData);
                }
                const currentSession = session_1.sessionManager.getPlayerSession(uid);
                if (currentSession) {
                    (0, helpers_1.kickPlayer)(uid, 'You have logged in from another location.');
                }
                const user = Users_1.users.getUser(uid);
                const email = user.user_metadata?.email ?? user.email ?? '';
                const username = (0, utils_2.formatEmailToName)(email);
                session_1.sessionManager.addPlayerToSession(socket.id, realmData.realmId, uid, username, profile.skin ?? '');
                const newSession = session_1.sessionManager.getPlayerSession(uid);
                const player = newSession.getPlayer(uid);
                socket.join(realmData.realmId);
                socket.emit('joinedRealm');
                emit('playerJoinedRoom', player);
                joiningInProgress.delete(uid);
            };
            if (data.owner_id === socket.handshake.query.uid) {
                return join();
            }
            if (data.only_owner) {
                return rejectJoin('This realm is private right now. Come back later!');
            }
            if (data.share_id === realmData.shareId) {
                return join();
            }
            else {
                return rejectJoin('The share link has been changed.');
            }
        });
        // Handle a disconnection
        on('disconnect', socket_types_1.Disconnect, ({ session, data }) => {
            const uid = socket.handshake.query.uid;
            const socketIds = session_1.sessionManager.getSocketIdsInRoom(session.id, session.getPlayerRoom(uid));
            const success = session_1.sessionManager.logOutBySocketId(socket.id);
            if (success) {
                emitToSocketIds(socketIds, 'playerLeftRoom', uid);
                Users_1.users.removeUser(uid);
            }
        });
        on('movePlayer', socket_types_1.MovePlayer, ({ session, data }) => {
            const player = session.getPlayer(socket.handshake.query.uid);
            const changedPlayers = session.movePlayer(player.uid, data.x, data.y);
            emit('playerMoved', {
                uid: player.uid,
                x: player.x,
                y: player.y
            });
            for (const uid of changedPlayers) {
                const changedPlayerData = session.getPlayer(uid);
                emitToSocketIds([changedPlayerData.socketId], 'proximityUpdate', {
                    proximityId: changedPlayerData.proximityId
                });
            }
        });
        on('teleport', socket_types_1.Teleport, ({ session, data }) => {
            const uid = socket.handshake.query.uid;
            const player = session.getPlayer(uid);
            if (player.room !== data.roomIndex) {
                emit('playerLeftRoom', uid);
                const session = session_1.sessionManager.getPlayerSession(uid);
                const changedPlayers = session.changeRoom(uid, data.roomIndex, data.x, data.y);
                emit('playerJoinedRoom', player);
                for (const uid of changedPlayers) {
                    const changedPlayerData = session.getPlayer(uid);
                    emitToSocketIds([changedPlayerData.socketId], 'proximityUpdate', {
                        proximityId: changedPlayerData.proximityId
                    });
                }
            }
            else {
                const changedPlayers = session.movePlayer(player.uid, data.x, data.y);
                emit('playerTeleported', { uid, x: player.x, y: player.y });
                for (const uid of changedPlayers) {
                    const changedPlayerData = session.getPlayer(uid);
                    emitToSocketIds([changedPlayerData.socketId], 'proximityUpdate', {
                        proximityId: changedPlayerData.proximityId
                    });
                }
            }
        });
        on('changedSkin', socket_types_1.ChangedSkin, ({ session, data }) => {
            const uid = socket.handshake.query.uid;
            const player = session.getPlayer(uid);
            player.skin = data;
            emit('playerChangedSkin', { uid, skin: player.skin });
        });
        on('sendMessage', socket_types_1.NewMessage, ({ session, data }) => {
            // cannot exceed 300 characters
            if (data.length > 300 || data.trim() === '')
                return;
            const message = (0, utils_1.removeExtraSpaces)(data);
            const uid = socket.handshake.query.uid;
            emit('receiveMessage', { uid, message });
        });
        // ─── Realm chat (persistent channels + DMs) ─────────────────────────
        socket.on('joinChatChannel', (channelId) => {
            if (typeof channelId !== 'string')
                return;
            socket.join(`chat:${channelId}`);
        });
        socket.on('leaveChatChannel', (channelId) => {
            if (typeof channelId !== 'string')
                return;
            socket.leave(`chat:${channelId}`);
        });
        socket.on('chatMessage', async (data) => {
            if (!data?.channelId || !data?.content)
                return;
            const content = data.content.trim().slice(0, 500);
            if (!content)
                return;
            const uid = socket.handshake.query.uid;
            const msg = await ChatMessage_1.default.create({
                channelId: data.channelId,
                senderId: uid,
                senderName: data.senderName || uid.slice(0, 8),
                content,
                timestamp: new Date(),
            });
            io.to(`chat:${data.channelId}`).emit('chatMessageReceived', {
                _id: msg._id,
                channelId: msg.channelId,
                senderId: msg.senderId,
                senderName: msg.senderName,
                content: msg.content,
                timestamp: msg.timestamp,
            });
        });
        socket.on('chatTyping', (data) => {
            if (!data?.channelId || !data?.username)
                return;
            socket.to(`chat:${data.channelId}`).emit('chatUserTyping', {
                channelId: data.channelId,
                username: data.username,
            });
        });
        // ─── Lobby chat (trang /chat, không cần join realm) ─────────────────
        socket.on('joinLobby', (data = {}) => {
            const uid = socket.handshake.query.uid;
            const u = Users_1.users.getUser(uid);
            const username = (data?.displayName && data.displayName.trim()) || (u ? (u.user_metadata?.displayName || (0, utils_2.formatEmailToName)(u.email || '')) : uid.slice(0, 8));
            socket.join('lobby');
            lobbyUsers[socket.id] = { uid, username };
            socket.emit('lobbyHistory', lobbyMessages.slice(-LOBBY_MAX));
        });
        socket.on('sendLobbyMessage', (data) => {
            const msg = typeof data?.message === 'string' ? data.message.trim() : '';
            if (!msg || msg.length > 300)
                return;
            const uid = socket.handshake.query.uid;
            const info = lobbyUsers[socket.id];
            const username = info?.username || uid.slice(0, 8);
            const item = { id: `lobby-${++lobbyIdCounter}`, uid, username, message: msg, timestamp: Date.now() };
            lobbyMessages.push(item);
            if (lobbyMessages.length > LOBBY_MAX)
                lobbyMessages.shift();
            io.to('lobby').emit('lobbyMessage', item);
        });
        socket.on('disconnect', () => {
            delete lobbyUsers[socket.id];
        });
    });
}
