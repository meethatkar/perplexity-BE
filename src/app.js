import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import { router as aiRoutes } from "./routes/ai.routes.js";
import morgan from "morgan";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

app.use(errorHandler);

export default app;
