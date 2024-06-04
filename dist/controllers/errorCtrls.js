"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../helpers/AppError"));
//* error functions
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError_1.default(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
    //* const [val] = Object.keys(err.keyValue);
    const val = Object.keys(err.keyValue);
    const message = `Duplicate field value: ${val.join(". ")}. Please use another value!`;
    return new AppError_1.default(message, 400);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError_1.default(message, 400);
};
const handleJWTError = () => new AppError_1.default("Invalid token. Please log in again!", 401);
const handleJWTExpiredError = () => new AppError_1.default("Your token has expired! Please log in again.", 401);
const handleZodError = (err) => {
    const errs = err.errors.map((item) => item.message);
    return new AppError_1.default(`${errs.join(", ")}`, 400);
};
const sendZodError = (err, req, res) => {
    const errs = err.errors.map((item) => item.message);
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: `${errs.join(", ")}`,
        stack: err.stack,
    });
};
//* Handle Send Production Error
const sendErrorProd = (err, req, res) => {
    //* A) API
    //* A) Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    //* B) Programming or other unknown error: don't leak error details
    //* 1) Log error
    //* 2) Send generic message
    return res.status(500).json({
        status: "error",
        message: "Something went very wrong!",
    });
};
//* Handle Send Development Error
const sendErrorDev = (err, req, res) => res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
});
function default_1(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "development") {
        if (err.name === "ZodError")
            return sendZodError(err, req, res);
        sendErrorDev(err, req, res);
    }
    else if (process.env.NODE_ENV === "production") {
        let error = Object.assign({}, err);
        error.message = err.message;
        if (error.name === "CastError")
            error = handleCastErrorDB(error);
        if (error.code === 11000)
            error = handleDuplicateFieldsDB(error);
        if (error._message === "User validation failed") {
            error = handleValidationErrorDB(error);
        }
        if (error.name === "JsonWebTokenError")
            error = handleJWTError();
        if (error.name === "TokenExpiredError")
            error = handleJWTExpiredError();
        if (error.name === "ZodError")
            error = handleZodError(error);
        sendErrorProd(error, req, res);
    }
}
exports.default = default_1;
