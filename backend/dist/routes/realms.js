"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth");
const Realm_1 = __importDefault(require("../models/Realm"));
const Profile_1 = __importDefault(require("../models/Profile"));
const User_1 = __importDefault(require("../models/User"));
const uuid_1 = require("uuid");
const Event_1 = __importDefault(require("../models/Event"));
const Thread_1 = __importDefault(require("../models/Thread"));
const Post_1 = __importDefault(require("../models/Post"));
const Resource_1 = __importDefault(require("../models/Resource"));
const ChatChannel_1 = __importDefault(require("../models/ChatChannel"));
const utils_1 = require("../utils");
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
const router = (0, express_1.Router)();
function auth(req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return null;
    return (0, auth_1.verifyToken)(token);
}
/** MongoDB ObjectId là 24 hex chars. UUID có dạng 8-4-4-4-12. */
function isObjectId(id) {
    return /^[a-fA-F0-9]{24}$/.test(id);
}
function realmQuery(id) {
    return isObjectId(id) ? { $or: [{ _id: id }, { id }] } : { id };
}
router.get('/realms', async (req, res) => {
    const user = auth(req);
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 50));
    const total = await Realm_1.default.countDocuments({ owner_id: user.id });
    const owned = await Realm_1.default.find({ owner_id: user.id }).select('id name share_id mapTemplate').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    return res.json({
        realms: owned.map((r) => ({ id: r.id || r._id?.toString(), name: r.name, share_id: r.share_id, mapTemplate: r.mapTemplate || 'office' })),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
});
router.get('/realms/by-share/:shareId', async (req, res) => {
    const realm = await Realm_1.default.findOne({ share_id: req.params.shareId }).lean();
    if (!realm)
        return res.status(404).json({ message: 'Not found' });
    return res.json({
        id: realm.id || realm._id?.toString(),
        name: realm.name,
        owner_id: realm.owner_id,
        map_data: realm.map_data,
        share_id: realm.share_id,
        only_owner: realm.only_owner,
    });
});
router.get('/realms/:id', async (req, res) => {
    const realm = await Realm_1.default.findOne(realmQuery(req.params.id)).lean();
    if (!realm)
        return res.status(404).json({ message: 'Not found' });
    return res.json({
        id: realm.id || realm._id?.toString(),
        name: realm.name,
        owner_id: realm.owner_id,
        map_data: realm.map_data,
        share_id: realm.share_id,
        only_owner: realm.only_owner,
    });
});
router.get('/realms/:id/members', async (req, res) => {
    const user = auth(req);
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    const realm = await Realm_1.default.findOne(realmQuery(req.params.id)).lean();
    if (!realm)
        return res.status(404).json({ message: 'Not found' });
    const shareId = realm.share_id;
    const members = [];
    async function resolveName(profileId, profileDisplayName) {
        if (profileDisplayName?.trim())
            return profileDisplayName.trim();
        const u = await User_1.default.findById(profileId).select('email displayName').lean();
        if (u?.displayName?.trim())
            return u.displayName.trim();
        if (u?.email)
            return (0, utils_1.formatEmailToName)(u.email);
        return profileId.slice(0, 8);
    }
    const ownerProfile = await Profile_1.default.findOne({ id: realm.owner_id }).lean();
    members.push({
        uid: realm.owner_id,
        displayName: await resolveName(realm.owner_id, ownerProfile?.displayName),
    });
    if (shareId) {
        const visitors = await Profile_1.default.find({ visited_realms: shareId })
            .select('id displayName')
            .limit(200)
            .lean();
        for (const v of visitors) {
            if (v.id === realm.owner_id)
                continue;
            members.push({
                uid: v.id,
                displayName: await resolveName(v.id, v.displayName),
            });
        }
    }
    return res.json({ members });
});
router.post('/realms', async (req, res) => {
    const user = auth(req);
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    const { name, map_data, mapTemplate } = req.body || {};
    const realm = await Realm_1.default.create({
        id: (0, uuid_1.v4)(),
        owner_id: user.id,
        name: name || 'New Space',
        map_data: map_data || null,
        mapTemplate: mapTemplate || 'office',
        share_id: (0, uuid_1.v4)().slice(0, 8),
        only_owner: false,
    });
    return res.status(201).json({
        id: realm.id || realm._id?.toString(),
        name: realm.name,
        share_id: realm.share_id,
        owner_id: realm.owner_id,
        mapTemplate: realm.mapTemplate,
    });
});
router.patch('/realms/:id', async (req, res) => {
    const user = auth(req);
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    const realm = await Realm_1.default.findOne(realmQuery(req.params.id));
    if (!realm || realm.owner_id !== user.id)
        return res.status(404).json({ message: 'Not found' });
    if (req.body.map_data !== undefined)
        realm.map_data = req.body.map_data;
    if (req.body.name !== undefined)
        realm.name = req.body.name;
    if (req.body.share_id !== undefined)
        realm.share_id = req.body.share_id;
    if (req.body.only_owner !== undefined)
        realm.only_owner = req.body.only_owner;
    await realm.save();
    return res.json(realm);
});
router.delete('/realms/:id', async (req, res) => {
    const user = auth(req);
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    const realm = await Realm_1.default.findOne(realmQuery(req.params.id));
    if (!realm || realm.owner_id !== user.id)
        return res.status(404).json({ message: 'Not found' });
    const realmId = realm.id || realm._id.toString();
    const shareId = realm.share_id;
    const channels = await ChatChannel_1.default.find({ realmId }).select('_id').lean();
    const channelIds = channels.map((c) => c._id);
    const threads = await Thread_1.default.find({ realmId }).select('_id').lean();
    const threadIds = threads.map((t) => t._id);
    await Promise.all([
        Event_1.default.deleteMany({ realmId }),
        Resource_1.default.deleteMany({ realmId }),
        threadIds.length ? Post_1.default.deleteMany({ threadId: { $in: threadIds } }) : Promise.resolve(),
        Thread_1.default.deleteMany({ realmId }),
        channelIds.length ? ChatMessage_1.default.deleteMany({ channelId: { $in: channelIds } }) : Promise.resolve(),
        ChatChannel_1.default.deleteMany({ realmId }),
        Realm_1.default.deleteOne({ _id: realm._id }),
    ]);
    if (shareId) {
        await Profile_1.default.updateMany({ visited_realms: shareId }, { $pull: { visited_realms: shareId } });
    }
    return res.status(204).send();
});
exports.default = router;
