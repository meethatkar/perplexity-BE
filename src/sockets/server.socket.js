import { Server } from "socket.io";
let io;
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("Socket IO is connected");

  io.on("connection", (socket) => {
    console.log("A user is connected: ", socket.id);
  });
}

export function getIo() {
  if (!io) {
    throw new Error("Socket not initialized");
  }
  return io;
}
