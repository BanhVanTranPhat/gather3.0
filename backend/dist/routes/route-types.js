"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPlayerCounts = exports.UserIsInGuild = exports.GetChannelName = exports.GetServerName = exports.IsOwnerOfServer = exports.GetPlayersInRoom = void 0;
const zod_1 = require("zod");
exports.GetPlayersInRoom = zod_1.z.object({
    roomIndex: zod_1.z.string().transform((val) => parseInt(val, 10)),
});
exports.IsOwnerOfServer = zod_1.z.object({
    serverId: zod_1.z.string(),
});
exports.GetServerName = zod_1.z.object({
    serverId: zod_1.z.string(),
});
exports.GetChannelName = zod_1.z.object({
    serverId: zod_1.z.string(),
    channelId: zod_1.z.string(),
    userId: zod_1.z.string(),
});
exports.UserIsInGuild = zod_1.z.object({
    guildId: zod_1.z.string(),
});
exports.GetPlayerCounts = zod_1.z.object({
    realmIds: zod_1.z.string().transform((s) => s.split(',')),
});
