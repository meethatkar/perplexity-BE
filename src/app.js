import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import { router as aiRoutes } from "./routes/ai.routes.js";
import morgan from "morgan";
import path from "path";

const app = express();
const allowedOrigins = [
  "http://localhost:5173", // Local Vite React Frontend
  "https://aether-ai-8bb5.onrender.com",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.static("./public"));
app.use(cookieParser());
app.use(morgan("dev"));

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

app.use("*name", (req, res) => {
  res.sendFile(path.join("__dirname", "..", "./public/index.html"));
});
app.use(errorHandler);

export default app;
