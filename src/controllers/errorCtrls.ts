import { NextFunction, Request, Response } from "express";

import AppError from "../helpers/AppError";

//* error functions
const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  //* const [val] = Object.keys(err.keyValue);

  const val = Object.keys(err.keyValue);

  const message = `Duplicate field value: ${val.join(
    ". "
  )}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const handleZodError = (err: any) => {
  const errs = err.errors.map((item: any) => item.message);
  return new AppError(`${errs.join(", ")}`, 400);
};

const sendZodError = (err: any, req: Request, res: Response) => {
  const errs = err.errors.map((item: any) => item.message);

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: `${errs.join(", ")}`,
    stack: err.stack,
  });
};

//* Handle Send Production Error

const sendErrorProd = (err: any, req: Request, res: Response) => {
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
const sendErrorDev = (err: any, req: Request, res: Response) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

export default function (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    if (err.name === "ZodError") return sendZodError(err, req, res);
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error._message === "User validation failed") {
      error = handleValidationErrorDB(error);
    }
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (error.name === "ZodError") error = handleZodError(error);

    sendErrorProd(error, req, res);
  }
}
