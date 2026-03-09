"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
class Users {
    constructor() {
        this.users = {};
    }
    addUser(id, user) {
        this.users[id] = user;
    }
    getUser(id) {
        return this.users[id];
    }
    removeUser(id) {
        delete this.users[id];
    }
}
const users = new Users();
exports.users = users;
