"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const sockets_1 = require("./sockets/sockets");
const routes_1 = __importDefault(require("./routes/routes"));
const realms_1 = __importDefault(require("./routes/realms"));
const profiles_1 = __importDefault(require("./routes/profiles"));
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const db_1 = require("./db");
require('dotenv').config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
app.use((0, cors_1.default)({
    origin: FRONTEND_ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '50mb' }));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: FRONTEND_ORIGIN,
        credentials: true,
    },
});
exports.io = io;
app.use((0, routes_1.default)());
app.use(auth_1.default);
app.use(realms_1.default);
app.use(profiles_1.default);
app.use(chat_1.default);
(0, sockets_1.sockets)(io);
const PORT = process.env.PORT || 4000;
(0, db_1.connectDb)().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
}).catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
});
