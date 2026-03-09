"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallResponse = exports.CallRequest = exports.MediaState = exports.NewMessage = exports.ChangedSkin = exports.Teleport = exports.MovePlayer = exports.Disconnect = exports.JoinRealm = void 0;
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
exports.MediaState = zod_1.z.object({
    micOn: zod_1.z.boolean(),
    camOn: zod_1.z.boolean(),
});
exports.CallRequest = zod_1.z.object({
    targetUid: zod_1.z.string(),
});
exports.CallResponse = zod_1.z.object({
    callerUid: zod_1.z.string(),
    accept: zod_1.z.boolean(),
});
