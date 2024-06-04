import http from "node:http";

import express, { Express } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { Server as SocketServer } from "socket.io";

import globalErrorHandler from "./controllers/errorCtrls";

import "./config/db";
import AppError from "./helpers/AppError";
import { userAuth } from "./socket/middelware";
import socket from "./socket";

dotenv.config();

const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["PATCH", "GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 8081;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

process.on("uncaughtException", (err: any) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err: any) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});

const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["POST", "GET"],
  },
});

io.use(userAuth);

// all realtime logic here
socket(io);
