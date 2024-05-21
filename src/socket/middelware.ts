import type { Socket } from "socket.io";
import { db } from "../config/db";

export const userAuth = async (socket: Socket, next: any) => {
  try {
    const userId = socket.handshake.auth.userId;
    if (userId) {
      const findUser = await db.user.findUnique({ where: { id: userId } });
      if (findUser) next();
      else throw new Error();
    } else {
      const err = new Error("unauthorized");
      next(err);
    }
  } catch (e) {
    next(new Error("unauthorized"));
  }
};
