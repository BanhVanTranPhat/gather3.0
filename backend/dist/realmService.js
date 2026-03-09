"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealmById = getRealmById;
exports.getProfileById = getProfileById;
const Realm_1 = __importDefault(require("./models/Realm"));
const Profile_1 = __importDefault(require("./models/Profile"));
async function getRealmById(id) {
    if (!id)
        return null;
    const realm = await Realm_1.default.findOne({ $or: [{ _id: id }, { id }] }).lean();
    if (!realm)
        return null;
    return {
        id: realm.id || realm._id?.toString(),
        owner_id: realm.owner_id,
        name: realm.name,
        map_data: realm.map_data,
        share_id: realm.share_id,
        only_owner: realm.only_owner,
    };
}
async function getProfileById(id) {
    const profile = await Profile_1.default.findOne({ id }).lean();
    return profile ? { id: profile.id, skin: profile.skin, visited_realms: profile.visited_realms || [] } : null;
}
