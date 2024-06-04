"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../helpers/utils");
let files_active_users;
function default_1(io) {
    // fired when client connected
    io.on("connection", (socket) => {
        const user_id = socket.handshake.auth.userId;
        if (!user_id)
            return socket.disconnect(true);
        socket.on("join_room", (roomId) => __awaiter(this, void 0, void 0, function* () {
            const data = yield (0, utils_1.findItemBaseOfType)(roomId);
            if (!data)
                socket.disconnect(true);
            for (const room of socket.rooms) {
                socket.leave(room);
            }
            if (!(data === null || data === void 0 ? void 0 : data.id))
                return socket.disconnect(true);
            socket.join(data.id);
            console.log("rooms :", socket.rooms);
        }));
        socket.on("join_file", (room_id, fileId, data, callback) => {
            const user_exist_in_file = files_active_users[fileId].find((e) => e.id === data.id);
            if (user_exist_in_file)
                return;
            files_active_users[fileId] = [
                ...files_active_users[fileId],
                Object.assign({}, data),
            ];
            socket
                .to(room_id)
                .emit("receive_file_online_users", files_active_users[fileId]);
            callback(files_active_users[fileId]);
        });
        socket.on("leave_file", (room_id, fileId, userId, callback) => {
            const user_exist_in_file = files_active_users[fileId].find((e) => e.id === userId);
            if (!user_exist_in_file)
                return;
            files_active_users[fileId] = files_active_users[fileId].filter((e) => e.id !== userId);
            socket
                .to(room_id)
                .emit("receive_file_online_users", files_active_users[fileId]);
        });
        socket.on("send_editor_changes", (deltas, room_id, fileId, by) => {
            socket
                .to(room_id)
                .emit("receive_editor_changes", deltas, room_id, fileId, by);
        });
        socket.on("send_cursor_move", (range, cursorId, room_id, fileId, by) => {
            socket
                .to(room_id)
                .emit("receive_cursor_move", range, cursorId, room_id, fileId, by);
        });
        // fired when client disconnected
        socket.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
            // TODO  update collaborator status to offline // ** Optional
            for (const room of socket.rooms) {
                socket.leave(room);
            }
            console.log("client disconnected");
            socket.disconnect(true);
        }));
    });
}
exports.default = default_1;
