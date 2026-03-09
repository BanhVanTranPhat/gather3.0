"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewMessage = exports.ChangedSkin = exports.Teleport = exports.MovePlayer = exports.Disconnect = exports.JoinRealm = void 0;
const zod_1 = require("zod");
exports.JoinRealm = zod_1.z.object({
    realmId: zod_1.z.string(),
    shareId: zod_1.z.string(),
});
exports.Disconnect = zod_1.z.any();
exports.MovePlayer = zod_1.z.object({
    x: zod_1.z.number(),
    y: zod_1.z.number(),
});
exports.Teleport = zod_1.z.object({
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    roomIndex: zod_1.z.number(),
});
exports.ChangedSkin = zod_1.z.string();
exports.NewMessage = zod_1.z.string();
