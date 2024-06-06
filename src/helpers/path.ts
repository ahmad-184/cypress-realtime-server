import path from "node:path";

export const rootDir = path.dirname(require.main?.filename || "");
