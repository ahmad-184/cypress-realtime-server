import { db } from "../config/db";

export const findItemBaseOfType = async (id: string) => {
  const existing_workspace = await db.workspace.findUnique({ where: { id } });
  return existing_workspace;
};
