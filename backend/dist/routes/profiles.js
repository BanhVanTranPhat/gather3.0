"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../auth");
const Profile_1 = __importDefault(require("../models/Profile"));
const router = (0, express_1.Router)();
function auth(req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return null;
    return (0, auth_1.verifyToken)(token);
}
router.get('/profiles/me', async (req, res) => {
    const user = auth(req);
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    let profile = await Profile_1.default.findOne({ id: user.id }).lean();
    if (!profile) {
        await Profile_1.default.create({ id: user.id, visited_realms: [], skin: undefined });
        profile = await Profile_1.default.findOne({ id: user.id }).lean();
    }
    return res.json(profile || { id: user.id, skin: undefined, visited_realms: [] });
});
router.patch('/profiles/me', async (req, res) => {
    const user = auth(req);
    if (!user)
        return res.status(401).json({ message: 'Unauthorized' });
    const profile = await Profile_1.default.findOneAndUpdate({ id: user.id }, { $set: req.body, updatedAt: new Date() }, { upsert: true, new: true }).lean();
    return res.json(profile);
});
exports.default = router;
