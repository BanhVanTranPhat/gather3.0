"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth");
const ChatChannel_1 = __importDefault(require("../models/ChatChannel"));
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
const router = (0, express_1.Router)();
function auth(req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return null;
    const user = (0, auth_1.verifyToken)(token);
    if (!user)
        return null;
    return { id: user.id, email: user.email, displayName: user.user_metadata?.displayName };
}
async function ensureDefaultChannels(realmId, userId) {
    const existing = await ChatChannel_1.default.findOne({ realmId, type: 'channel' });
    if (existing)
        return;
    await ChatChannel_1.default.insertMany([
        { realmId, name: 'general', type: 'channel', members: [], createdBy: userId },
        { realmId, name: 'social', type: 'channel', members: [], createdBy: userId },
    ]);
}
router.get('/chat/channels/:realmId', async (req, res) => {
    const user = auth(req);
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    const { realmId } = req.params;
    await ensureDefaultChannels(realmId, user.id);
    const channels = await ChatChannel_1.default.find({
        realmId,
        $or: [
            { type: 'channel' },
            { type: 'dm', members: user.id },
        ],
    }).sort({ type: 1, createdAt: 1 });
    return res.json({ channels });
});
router.post('/chat/channels', async (req, res) => {
    const user = auth(req);
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    const { realmId, name, type, members } = req.body;
    if (!realmId || !name || !type) {
        return res.status(400).json({ message: 'realmId, name, type required' });
    }
    if (type === 'dm') {
        if (!members || !Array.isArray(members) || members.length !== 2) {
            return res.status(400).json({ message: 'DM requires exactly 2 members' });
        }
        const existing = await ChatChannel_1.default.findOne({
            realmId,
            type: 'dm',
            members: { $all: members, $size: 2 },
        });
        if (existing)
            return res.json({ channel: existing });
    }
    const channel = await ChatChannel_1.default.create({
        realmId,
        name: name.slice(0, 30),
        type,
        members: members || [],
        createdBy: user.id,
    });
    return res.json({ channel });
});
router.get('/chat/messages/:channelId', async (req, res) => {
    const user = auth(req);
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    const { channelId } = req.params;
    const channel = await ChatChannel_1.default.findById(channelId).lean();
    if (!channel)
        return res.status(404).json({ message: 'Channel not found' });
    if (channel.type === 'dm' && !channel.members.includes(user.id)) {
        return res.status(403).json({ message: 'Not a member of this channel' });
    }
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const messages = await ChatMessage_1.default.find({ channelId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    return res.json({ messages: messages.reverse(), page, hasMore: messages.length === limit });
});
router.delete('/chat/channels/:channelId', async (req, res) => {
    const user = auth(req);
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    const channel = await ChatChannel_1.default.findById(req.params.channelId);
    if (!channel)
        return res.status(404).json({ message: 'Channel not found' });
    if (channel.createdBy !== user.id)
        return res.status(403).json({ message: 'Not owner' });
    if (channel.type === 'channel' && ['general', 'social'].includes(channel.name)) {
        return res.status(400).json({ message: 'Cannot delete default channels' });
    }
    await ChatMessage_1.default.deleteMany({ channelId: channel._id });
    await channel.deleteOne();
    return res.json({ success: true });
});
exports.default = router;
