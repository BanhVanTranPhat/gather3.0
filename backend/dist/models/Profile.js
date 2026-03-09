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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const profileSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    skin: { type: String },
    avatar: { type: String },
    avatarConfig: { type: mongoose_1.Schema.Types.Mixed },
    displayName: { type: String, maxlength: 100 },
    bio: { type: String, default: '', maxlength: 500 },
    visited_realms: { type: [String], default: [], validate: [(v) => v.length <= 500, 'Too many visited realms'] },
    lastPositions: { type: Map, of: new mongoose_1.Schema({ x: Number, y: Number, room: Number }, { _id: false }), default: new Map() },
}, { timestamps: true });
profileSchema.index({ visited_realms: 1 });
exports.default = mongoose_1.default.model('Profile', profileSchema);
