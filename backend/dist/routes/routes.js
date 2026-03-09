"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = routes;
const express_1 = require("express");
const route_types_1 = require("./route-types");
const auth_1 = require("../auth");
const session_1 = require("../session");
function routes() {
    const router = (0, express_1.Router)();
    router.get('/getPlayersInRoom', async (req, res) => {
        const access_token = req.headers.authorization?.split(' ')[1];
        if (!access_token) {
            return res.status(401).json({ message: 'No access token provided' });
        }
        const params = req.query;
        if (!route_types_1.GetPlayersInRoom.safeParse(params).success) {
            return res.status(400).json({ message: 'Invalid parameters' });
        }
        const user = (0, auth_1.verifyToken)(access_token);
        if (!user) {
            return res.status(401).json({ message: 'Invalid access token' });
        }
        const session = session_1.sessionManager.getPlayerSession(user.id);
        if (!session) {
            return res.status(400).json({ message: 'User not in a realm.' });
        }
        const players = session.getPlayersInRoom(params.roomIndex);
        return res.json({ players });
    });
    router.get('/getPlayerCounts', async (req, res) => {
        const access_token = req.headers.authorization?.split(' ')[1];
        if (!access_token) {
            return res.status(401).json({ message: 'No access token provided' });
        }
        let params = req.query;
        const parseResults = route_types_1.GetPlayerCounts.safeParse(params);
        if (!parseResults.success) {
            return res.status(400).json({ message: 'Invalid parameters' });
        }
        params = parseResults.data;
        if (params.realmIds.length > 100) {
            return res.status(400).json({ message: 'Too many server IDs' });
        }
        const user = (0, auth_1.verifyToken)(access_token);
        if (!user) {
            return res.status(401).json({ message: 'Invalid access token' });
        }
        const playerCounts = [];
        for (const realmId of params.realmIds) {
            const session = session_1.sessionManager.getSession(realmId);
            if (session) {
                const playerCount = session.getPlayerCount();
                playerCounts.push(playerCount);
            }
            else {
                playerCounts.push(0);
            }
        }
        return res.json({ playerCounts });
    });
    return router;
}
