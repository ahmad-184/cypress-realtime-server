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
exports.userAuth = void 0;
const db_1 = require("../config/db");
const userAuth = (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = socket.handshake.auth.userId;
        if (userId) {
            const findUser = yield db_1.db.user.findUnique({ where: { id: userId } });
            if (findUser)
                next();
            else
                throw new Error();
        }
        else {
            const err = new Error("unauthorized");
            next(err);
        }
    }
    catch (e) {
        next(new Error("unauthorized"));
    }
});
exports.userAuth = userAuth;
