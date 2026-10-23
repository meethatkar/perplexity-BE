import { verifyUser } from "../middlewares/auth.middleware.js";
import express from "express";
import { processAIRequest } from "../controllers/chat.controller.js";

export const router = express.Router();

router.post("/ask-ai", verifyUser, processAIRequest);
