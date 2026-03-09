"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth");
const Realm_1 = __importDefault(require("../models/Realm"));
const uuid_1 = require("uuid");
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
    const owned = await Realm_1.default.find({ owner_id: user.id }).select('id name share_id').lean();
    return res.json(owned.map((r) => ({ id: r._id?.toString() || r.id, name: r.name, share_id: r.share_id })));
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
router.post('/realms', async (req, res) => {
    const user = auth(req);
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    const { name, map_data } = req.body || {};
    const realm = await Realm_1.default.create({
        id: (0, uuid_1.v4)(),
        owner_id: user.id,
        name: name || 'New Space',
        map_data: map_data || null,
        share_id: (0, uuid_1.v4)().slice(0, 8),
        only_owner: false,
    });
    return res.status(201).json({
        id: realm.id || realm._id?.toString(),
        name: realm.name,
        share_id: realm.share_id,
        owner_id: realm.owner_id,
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
    await Realm_1.default.deleteOne({ _id: realm._id });
    return res.status(204).send();
});
exports.default = router;
