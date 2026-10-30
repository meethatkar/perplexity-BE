import { verifyUser } from "../middlewares/auth.middleware.js";
import express from "express";
import {
  deleteChat,
  getChats,
  getMessages,
  processAIRequest,
} from "../controllers/chat.controller.js";

export const router = express.Router();

router.post("/ask-ai", verifyUser, processAIRequest);
router.get("/", verifyUser, getChats);
router.get("/:chatId/messages", verifyUser, getMessages);
router.post("/chat/delete", verifyUser, deleteChat);
