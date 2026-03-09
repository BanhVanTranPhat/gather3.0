"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeExtraSpaces = removeExtraSpaces;
exports.formatForComaprison = formatForComaprison;
exports.getRoomFromName = getRoomFromName;
exports.getRoomNames = getRoomNames;
exports.getRoomNamesWithChannelId = getRoomNamesWithChannelId;
exports.formatEmailToName = formatEmailToName;
function removeExtraSpaces(text) {
    let value = text.replace(/\s\s+/g, ' ');
    if (value.startsWith(' ')) {
        value = value.substring(1);
    }
    value = value.trim();
    return value;
}
function formatForComaprison(text) {
    return removeExtraSpaces(text.toLowerCase());
}
function getRoomFromName(mapData, name) {
    const room = mapData.rooms.find(room => formatForComaprison(room.name) === formatForComaprison(name));
    return room;
}
function getRoomNames(mapData) {
    return mapData.rooms.map(room => room.name);
}
function getRoomNamesWithChannelId(mapData, channelId) {
    return mapData.rooms.filter(room => room.channelId === channelId).map(room => room.name);
}
function formatEmailToName(email) {
    const name = email.split('@')[0];
    return name;
}
