"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importStar(require("../models/User"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-12345';
router.post('/auth/register', async (req, res) => {
    const { email, password, displayName } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ message: 'Email and password required' });
    const existing = await User_1.default.findOne({ email: String(email).trim().toLowerCase() });
    if (existing)
        return res.status(400).json({ message: 'Email already registered' });
    const hashed = await (0, User_1.hashPassword)(password);
    const user = await User_1.default.create({
        email: String(email).trim().toLowerCase(),
        password: hashed,
        displayName: displayName ? String(displayName).trim() : undefined,
    });
    const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), email: user.email, displayName: user.displayName }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
        token,
        user: { id: user._id.toString(), email: user.email, displayName: user.displayName },
    });
});
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ message: 'Email and password required' });
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User_1.default.findOne({ email: normalizedEmail });
    if (!user)
        return res.status(401).json({ message: 'Email chưa đăng ký hoặc sai mật khẩu' });
    if (!user.password)
        return res.status(401).json({ message: 'Tài khoản đăng nhập bằng Google. Vui lòng dùng Google.' });
    const ok = await (0, User_1.comparePassword)(String(password), user.password);
    if (!ok)
        return res.status(401).json({ message: 'Email chưa đăng ký hoặc sai mật khẩu' });
    const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), email: user.email, displayName: user.displayName }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
        token,
        user: { id: user._id.toString(), email: user.email, displayName: user.displayName },
    });
});
router.post('/auth/google', async (req, res) => {
    const { googleId, email, username, avatar } = req.body || {};
    if (!googleId || !email)
        return res.status(400).json({ message: 'Google ID and email are required' });
    const normalizedEmail = String(email).trim().toLowerCase();
    let user = await User_1.default.findOne({ googleId });
    if (!user) {
        const existing = await User_1.default.findOne({ email: normalizedEmail });
        if (existing) {
            existing.googleId = googleId;
            if (avatar)
                existing.avatar = avatar;
            user = await existing.save();
        }
        else {
            user = await User_1.default.create({
                email: normalizedEmail,
                googleId,
                displayName: username ? String(username).trim() : normalizedEmail.split('@')[0],
                avatar: avatar || undefined,
            });
        }
    }
    else if (avatar) {
        user.avatar = avatar;
        await user.save();
    }
    const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), email: user.email, displayName: user.displayName }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
        token,
        user: { id: user._id.toString(), email: user.email, displayName: user.displayName, avatar: user.avatar },
    });
});
router.get('/auth/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return res.json({ id: decoded.userId, email: decoded.email, displayName: decoded.displayName });
    }
    catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
});
exports.default = router;
