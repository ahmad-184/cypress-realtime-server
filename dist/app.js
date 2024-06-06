"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const socket_io_1 = require("socket.io");
const errorCtrls_1 = __importDefault(require("./controllers/errorCtrls"));
require("./config/db");
const AppError_1 = __importDefault(require("./helpers/AppError"));
const middelware_1 = require("./socket/middelware");
const socket_1 = __importDefault(require("./socket"));
const node_path_1 = __importDefault(require("node:path"));
const path_1 = require("./helpers/path");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["PATCH", "GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(node_path_1.default.join(path_1.rootDir, "../", "public")));
// Test Api
app.get("/", (_, res) => {
    res.sendFile(node_path_1.default.join(path_1.rootDir, "../", "templates", "template.html"));
});
app.all("*", (req, res, next) => {
    next(new AppError_1.default(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorCtrls_1.default);
const PORT = process.env.PORT || 8081;
const server = node_http_1.default.createServer(app);
server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
});
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
process.on("SIGTERM", () => {
    console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
    server.close(() => {
        console.log("💥 Process terminated!");
    });
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["POST", "GET"],
    },
});
io.use(middelware_1.userAuth);
// all realtime logic here
(0, socket_1.default)(io);
