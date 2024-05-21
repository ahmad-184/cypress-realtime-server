import type { Server } from "socket.io";

export default function (io: Server) {
  // fired when client connected
  io.on("connection", (socket) => {
    const user_id = socket.handshake.auth.userId;

    if (user_id) {
      socket.join(user_id);
      console.log(socket.client);
    } else {
      socket.disconnect(true);
    }
  });
  // fired when client disconnected
  io.on("disconnect", async (socket) => {
    // TODO  update collaborator status to offline
    socket.disconnect(0);
  });
}
