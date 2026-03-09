"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
if (!process.env.JWT_SECRET)
    throw new Error('JWT_SECRET environment variable is required');
const JWT_SECRET = process.env.JWT_SECRET;
/** Verify JWT (giống Gather). */
function verifyToken(accessToken) {
    try {
        const decoded = jsonwebtoken_1.default.verify(accessToken, JWT_SECRET);
        const userId = decoded.userId || decoded.id || decoded.sub;
        if (!userId)
            return null;
        return {
            id: userId,
            email: decoded.email,
            user_metadata: { email: decoded.email, displayName: decoded.displayName },
        };
    }
    catch {
        return null;
    }
}
