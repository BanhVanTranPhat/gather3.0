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
const nodemailer_1 = __importDefault(require("nodemailer"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const User_1 = __importStar(require("../models/User"));
const router = (0, express_1.Router)();
if (!process.env.JWT_SECRET)
    throw new Error('JWT_SECRET environment variable is required');
const JWT_SECRET = process.env.JWT_SECRET;
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
const otpLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 3,
    message: { message: 'Too many OTP requests, please wait' },
    standardHeaders: true,
    legacyHeaders: false,
});
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpStore = new Map();
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function getMailTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass)
        return null;
    return nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });
}
router.post('/auth/send-otp', otpLimiter, async (req, res) => {
    const { email } = req.body || {};
    if (!email)
        return res.status(400).json({ message: 'Email is required' });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail))
        return res.status(400).json({ message: 'Invalid email format' });
    const code = generateOtp();
    otpStore.set(normalizedEmail, { code, expiresAt: Date.now() + 10 * 60 * 1000 });
    const transporter = getMailTransporter();
    if (transporter) {
        try {
            await transporter.sendMail({
                from: `"The Gathering" <${process.env.EMAIL_USER}>`,
                to: normalizedEmail,
                subject: 'Mã xác thực - The Gathering',
                html: `
          <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px">
            <h2 style="color:#0d9488;margin:0 0 8px">The Gathering</h2>
            <p style="color:#374151;font-size:14px">Mã xác thực của bạn:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:16px;background:#fff;border-radius:8px;border:1px solid #e5e7eb;color:#0d9488">${code}</div>
            <p style="color:#6b7280;font-size:12px;margin-top:12px">Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu mã này, hãy bỏ qua email.</p>
          </div>
        `,
            });
        }
        catch (err) {
            console.error('Failed to send OTP email:', err);
        }
    }
    else {
        console.log(`[DEV] OTP for ${normalizedEmail}: ${code}`);
    }
    const userExists = await User_1.default.findOne({ email: normalizedEmail });
    return res.json({ sent: true, isNewUser: !userExists });
});
router.post('/auth/verify-otp', authLimiter, async (req, res) => {
    const { email, code, displayName } = req.body || {};
    if (!email || !code)
        return res.status(400).json({ message: 'Email and OTP code are required' });
    const normalizedEmail = String(email).trim().toLowerCase();
    const stored = otpStore.get(normalizedEmail);
    if (!stored)
        return res.status(400).json({ message: 'Chưa gửi mã xác thực cho email này' });
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ message: 'Mã xác thực đã hết hạn. Vui lòng gửi lại.' });
    }
    if (stored.code !== String(code).trim()) {
        return res.status(400).json({ message: 'Mã xác thực không đúng' });
    }
    otpStore.delete(normalizedEmail);
    let user = await User_1.default.findOne({ email: normalizedEmail });
    if (!user) {
        user = await User_1.default.create({
            email: normalizedEmail,
            displayName: displayName ? String(displayName).trim() : normalizedEmail.split('@')[0],
            emailVerified: true,
        });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), email: user.email, displayName: user.displayName, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
        token,
        user: { id: user._id.toString(), email: user.email, displayName: user.displayName, role: user.role || 'user' },
    });
});
router.post('/auth/register', async (req, res) => {
    const { email, password, displayName } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ message: 'Email and password required' });
    const regEmail = String(email).trim().toLowerCase();
    if (!EMAIL_RE.test(regEmail))
        return res.status(400).json({ message: 'Invalid email format' });
    if (String(password).length < 6 || String(password).length > 128)
        return res.status(400).json({ message: 'Password must be 6-128 characters' });
    const existing = await User_1.default.findOne({ email: regEmail });
    if (existing)
        return res.status(400).json({ message: 'Email already registered' });
    const hashed = await (0, User_1.hashPassword)(password);
    const user = await User_1.default.create({
        email: String(email).trim().toLowerCase(),
        password: hashed,
        displayName: displayName ? String(displayName).trim() : undefined,
    });
    const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), email: user.email, displayName: user.displayName, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
        token,
        user: { id: user._id.toString(), email: user.email, displayName: user.displayName, role: user.role || 'user' },
    });
});
router.post('/auth/login', authLimiter, async (req, res) => {
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
    const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), email: user.email, displayName: user.displayName, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
        token,
        user: { id: user._id.toString(), email: user.email, displayName: user.displayName, role: user.role || 'user' },
    });
});
router.post('/auth/google', authLimiter, async (req, res) => {
    let { googleId, email, username, avatar } = req.body || {};
    if (req.body.credential) {
        try {
            const parts = req.body.credential.split('.');
            if (parts.length !== 3)
                return res.status(400).json({ message: 'Invalid credential' });
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            googleId = payload.sub;
            email = payload.email;
            username = username || payload.name || payload.email?.split('@')[0];
            avatar = avatar || payload.picture;
        }
        catch {
            return res.status(400).json({ message: 'Invalid Google credential' });
        }
    }
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
    const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), email: user.email, displayName: user.displayName, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
        token,
        user: { id: user._id.toString(), email: user.email, displayName: user.displayName, avatar: user.avatar, role: user.role || 'user' },
    });
});
router.get('/auth/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return res.json({ id: decoded.userId, email: decoded.email, displayName: decoded.displayName, role: decoded.role || 'user' });
    }
    catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
});
exports.default = router;
