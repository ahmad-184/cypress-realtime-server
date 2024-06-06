"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootDir = void 0;
const node_path_1 = __importDefault(require("node:path"));
exports.rootDir = node_path_1.default.dirname(((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename) || "");
