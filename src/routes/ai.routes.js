import { verifyUser } from "../middlewares/auth.middleware.js";
import { uploadAudio } from "../middlewares/upload.middleware.js";
import express from "express";
import {
  deleteChat,
  getChats,
  getMessages,
  processAIRequest,
} from "../controllers/chat.controller.js";
import { handleTranscribe } from "../controllers/transcribe.controller.js";

export const router = express.Router();

router.post("/ask-ai", verifyUser, processAIRequest);
router.get("/", verifyUser, getChats);
router.get("/:chatId/messages", verifyUser, getMessages);
router.post("/chat/delete", verifyUser, deleteChat);
router.post(
  "/transcribe",
  verifyUser,
  uploadAudio.single("audio"),
  handleTranscribe,
);
