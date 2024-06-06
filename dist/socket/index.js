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
let files_active_users = [];
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
        socket.on("join_file", (room_id, fileId, data) => {
            var _a;
            const user_exist_in_file = files_active_users === null || files_active_users === void 0 ? void 0 : files_active_users.find((e) => e.id === fileId);
            if (!user_exist_in_file) {
                files_active_users = [
                    ...files_active_users,
                    {
                        id: fileId,
                        data: [Object.assign({}, data)],
                    },
                ];
                socket
                    .to(room_id)
                    .emit("receive_file_online_users", fileId, [Object.assign({}, data)]);
            }
            else {
                const index = files_active_users === null || files_active_users === void 0 ? void 0 : files_active_users.findIndex((e) => e.id === fileId);
                const is_user_exist = (_a = files_active_users[index].data) === null || _a === void 0 ? void 0 : _a.find((e) => e.id === data.id);
                if (is_user_exist) {
                    socket
                        .to(room_id)
                        .emit("receive_file_online_users", fileId, files_active_users[index].data);
                }
                else {
                    files_active_users[index].data = [
                        ...files_active_users[index].data,
                        Object.assign({}, data),
                    ];
                    socket
                        .to(room_id)
                        .emit("receive_file_online_users", fileId, files_active_users[index].data);
                }
            }
        });
        socket.on("leave_file", (room_id, fileId, userId) => {
            const file_exist = files_active_users === null || files_active_users === void 0 ? void 0 : files_active_users.find((e) => e.id === fileId);
            if (!file_exist)
                return;
            const index = files_active_users.findIndex((e) => e.id === fileId);
            files_active_users[index].data = files_active_users[index].data.filter((e) => e.id !== userId);
            socket
                .to(room_id)
                .emit("receive_file_online_users", fileId, files_active_users[index].data);
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
        socket.on("change_title", (room_id, fileId, title, type, folderId, by) => {
            socket
                .to(room_id)
                .emit("receive_changed_title", room_id, fileId, title, type, folderId, by);
        });
        socket.on("change_icon", (room_id, fileId, icon, type, folderId, by) => {
            socket
                .to(room_id)
                .emit("receive_changed_icon", room_id, fileId, icon, type, folderId, by);
        });
        socket.on("change_banner", (room_id, fileId, banner, type, folderId, banner_public_id, by) => {
            socket
                .to(room_id)
                .emit("receive_changed_banner", room_id, fileId, banner, type, folderId, banner_public_id, by);
        });
        socket.on("add_folder", (room_id, data, by) => {
            socket.to(room_id).emit("receive_folder", room_id, data, by);
        });
        socket.on("add_file", (room_id, data, by) => {
            socket.to(room_id).emit("receive_file", room_id, data, by);
        });
        socket.on("to_trash_file/folder", (room_id, id, folderId, type, by, status, inTrashBy) => {
            socket
                .to(room_id)
                .emit("receive_in_trash_file/folder", room_id, id, folderId, type, by, status, inTrashBy);
        });
        socket.on("delete_file/folder", (room_id, id, type, folderId, by) => {
            socket
                .to(room_id)
                .emit("receive_deleted_file/folder", room_id, id, type, folderId, by);
        });
        socket.on("update_workspace_settings", (room_id, data, by) => {
            socket
                .to(room_id)
                .emit("receive_updated_workspace_settgins", room_id, data, by);
        });
        socket.on("delete_workspace", (room_id, by) => {
            socket.to(room_id).emit("receive_deleted_workspace", room_id, by);
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
