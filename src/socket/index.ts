import type { Server } from "socket.io";
import { findItemBaseOfType } from "../helpers/utils";

type OnlineUserType = {
  id: string;
  email: string;
  image: string;
  name: string;
};

let files_active_users: {
  id: string;
  data: OnlineUserType[];
}[] = [];

export default function (io: Server) {
  // fired when client connected
  io.on("connection", (socket) => {
    const user_id = socket.handshake.auth.userId;

    if (!user_id) return socket.disconnect(true);

    socket.on("join_room", async (roomId: string) => {
      const data = await findItemBaseOfType(roomId);
      if (!data) socket.disconnect(true);

      for (const room of socket.rooms) {
        socket.leave(room);
      }

      if (!data?.id) return socket.disconnect(true);
      socket.join(data.id);
      console.log("rooms :", socket.rooms);
    });

    socket.on(
      "join_file",
      (room_id: string, fileId: string, data: OnlineUserType) => {
        const user_exist_in_file = files_active_users?.find(
          (e) => e.id === fileId
        );
        if (!user_exist_in_file) {
          files_active_users = [
            ...files_active_users,
            {
              id: fileId,
              data: [{ ...data }],
            },
          ];

          socket
            .to(room_id)
            .emit("receive_file_online_users", fileId, [{ ...data }]);
        } else {
          const index = files_active_users?.findIndex((e) => e.id === fileId);
          const is_user_exist = files_active_users[index].data?.find(
            (e) => e.id === data.id
          );
          if (is_user_exist) {
            socket
              .to(room_id)
              .emit(
                "receive_file_online_users",
                fileId,
                files_active_users[index].data
              );
          } else {
            files_active_users[index].data = [
              ...files_active_users[index].data,
              { ...data },
            ];

            socket
              .to(room_id)
              .emit(
                "receive_file_online_users",
                fileId,
                files_active_users[index].data
              );
          }
        }
      }
    );

    socket.on(
      "leave_file",
      (room_id: string, fileId: string, userId: string) => {
        const file_exist = files_active_users?.find((e) => e.id === fileId);
        if (!file_exist) return;

        const index = files_active_users.findIndex((e) => e.id === fileId);

        files_active_users[index].data = files_active_users[index].data.filter(
          (e) => e.id !== userId
        );

        socket
          .to(room_id)
          .emit(
            "receive_file_online_users",
            fileId,
            files_active_users[index].data
          );
      }
    );

    socket.on(
      "send_editor_changes",
      (deltas: any, room_id: string, fileId: string, by: string) => {
        socket
          .to(room_id)
          .emit("receive_editor_changes", deltas, room_id, fileId, by);
      }
    );

    socket.on(
      "send_cursor_move",
      (
        range: any,
        cursorId: string,
        room_id: string,
        fileId: string,
        by: string
      ) => {
        socket
          .to(room_id)
          .emit("receive_cursor_move", range, cursorId, room_id, fileId, by);
      }
    );

    socket.on(
      "change_title",
      (
        room_id: string,
        fileId: string,
        title: string,
        type: string,
        folderId: string,
        by: string
      ) => {
        socket
          .to(room_id)
          .emit(
            "receive_changed_title",
            room_id,
            fileId,
            title,
            type,
            folderId,
            by
          );
      }
    );

    socket.on(
      "change_icon",
      (
        room_id: string,
        fileId: string,
        icon: string,
        type: string,
        folderId: string,
        by: string
      ) => {
        socket
          .to(room_id)
          .emit(
            "receive_changed_icon",
            room_id,
            fileId,
            icon,
            type,
            folderId,
            by
          );
      }
    );

    socket.on(
      "change_banner",
      (
        room_id: string,
        fileId: string,
        banner: string,
        type,
        folderId: string,
        banner_public_id: string,
        by: string
      ) => {
        socket
          .to(room_id)
          .emit(
            "receive_changed_banner",
            room_id,
            fileId,
            banner,
            type,
            folderId,
            banner_public_id,
            by
          );
      }
    );

    socket.on("add_folder", (room_id: string, data: any, by: string) => {
      socket.to(room_id).emit("receive_folder", room_id, data, by);
    });

    socket.on("add_file", (room_id: string, data: File, by: string) => {
      socket.to(room_id).emit("receive_file", room_id, data, by);
    });

    socket.on(
      "to_trash_file/folder",
      (
        room_id: string,
        id: string,
        folderId: string,
        type: "file" | "folder" | "workspace",
        by: string,
        status: boolean,
        inTrashBy: string
      ) => {
        socket
          .to(room_id)
          .emit(
            "receive_in_trash_file/folder",
            room_id,
            id,
            folderId,
            type,
            by,
            status,
            inTrashBy
          );
      }
    );

    socket.on(
      "delete_file/folder",
      (
        room_id: string,
        id: string,
        type: "file" | "folder" | "workspace",
        folderId: string,
        by: string
      ) => {
        socket
          .to(room_id)
          .emit("receive_deleted_file/folder", room_id, id, type, folderId, by);
      }
    );

    socket.on("update_workspace_settings", (room_id, data, by) => {
      socket
        .to(room_id)
        .emit("receive_updated_workspace_settgins", room_id, data, by);
    });

    socket.on("delete_workspace", (room_id: string, by: string) => {
      socket.to(room_id).emit("receive_deleted_workspace", room_id, by);
    });

    // fired when client disconnected
    socket.on("disconnect", async () => {
      // TODO  update collaborator status to offline // ** Optional
      for (const room of socket.rooms) {
        socket.leave(room);
      }

      console.log("client disconnected");
      socket.disconnect(true);
    });
  });
}
