import "dotenv/config";
import { connectDB } from "./src/config/database.js";
import app from "./src/app.js";
import http from "http";
import { initSocket } from "./src/sockets/server.socket.js";

const PORT = process.env.PORT;

const httpServer = http.createServer(app);

initSocket(httpServer);

connectDB()
  .then(() => {
    httpServer.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });
