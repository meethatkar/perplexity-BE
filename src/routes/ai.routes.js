import { verifyUser } from "../middlewares/auth.middleware.js";
import express from "express";
import { askAi } from "../services/ai.service.js";

export const router = express.Router();

router.post("/ask-ai", verifyUser, async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === "" || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid prompt" });
    }

    const response = await askAi(prompt);
    console.log("ai ai ai: ", response);

    if (!response) {
      return res
        .status(500)
        .json({ success: false, message: "AI service error" });
    }

    return res.status(200).json({
      success: true,
      message: "Prompt processed successfully",
      response,
    });
  } catch (error) {
    next(error);
  }
});
