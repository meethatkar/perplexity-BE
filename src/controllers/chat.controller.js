import {
  askAi,
  generateFollowUpQuestions,
  generateTitle,
} from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { sendSuccess } from "../utils/response.js";
import {
  ValidationError,
  NotFoundError,
  AppError,
  RateLimitError,
} from "../utils/AppError.js";

export const processAIRequest = async (req, res, next) => {
  let createdMessageId = null;
  let createdChatId = null;

  try {
    const { prompt, chatID } = req.body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return next(
        new ValidationError(
          { prompt: "Prompt text is required" },
          "Invalid prompt",
        ),
      );
    }

    let chatData;
    if (!chatID) {
      const title = await generateTitle(prompt);
      chatData = await chatModel.create({
        user: req.user.id,
        title: title,
      });
      createdChatId = chatData._id;
    }

    const activeChatId = chatID || chatData._id;

    const userMessage = await messageModel.create({
      chat: activeChatId,
      content: prompt.trim(),
      role: "user",
    });
    createdMessageId = userMessage._id;

    const messages = await messageModel
      .find({ chat: activeChatId })
      .sort({ createdAt: 1 });

    let response;
    try {
      response = await askAi(messages);
    } catch (aiErr) {
      // Check if the AI provider returned a 429 rate limit error
      const isRateLimited =
        aiErr?.statusCode === 429 ||
        aiErr?.status === 429 ||
        aiErr?.message?.includes("429") ||
        aiErr?.message?.includes("Rate limit") ||
        aiErr?.body?.includes?.("rate_limited");

      if (isRateLimited) {
        throw new RateLimitError(
          "AI provider rate limit reached. Please wait a moment and try again.",
        );
      }
      throw aiErr;
    }

    if (!response) {
      throw new AppError("Failed to generate AI response", 502, "AI_SERVICE_ERROR");
    }

    const aiResponseData = await messageModel.create({
      chat: activeChatId,
      content: response,
      role: "ai",
    });

    const suggestions = await generateFollowUpQuestions(prompt, response);

    return sendSuccess(res, 200, "Prompt processed successfully", {
      response: aiResponseData,
      chatDetails: chatData,
      suggestions: suggestions || [],
    });
  } catch (error) {
    // If an error occurred (such as rate limiting), remove the user message and newly created empty chat from Database
    try {
      if (createdMessageId) {
        await messageModel.findByIdAndDelete(createdMessageId);
      }
      if (createdChatId) {
        await chatModel.findByIdAndDelete(createdChatId);
      }
    } catch (cleanupErr) {
      console.error("Error cleaning up message/chat after failure:", cleanupErr);
    }

    next(error);
  }
};

export const getChats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chats = await chatModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Chats fetched successfully", { chats });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
      _id: chatId,
      user: userId,
    });

    if (!chat) {
      return next(new NotFoundError("Conversation thread not found"));
    }

    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 });

    return sendSuccess(res, 200, "Messages fetched for chat", { messages });
  } catch (error) {
    next(error);
  }
};

export const deleteChat = async (req, res, next) => {
  const { chatID } = req.body;
  const userId = req.user.id;

  try {
    if (!chatID) {
      return next(new ValidationError({ chatID: "chatID is required" }));
    }

    const deleteChat = await chatModel.findOneAndDelete({
      _id: chatID,
      user: userId,
    });

    if (!deleteChat) {
      return next(new NotFoundError("Chat conversation not found"));
    }

    await messageModel.deleteMany({
      chat: chatID,
    });

    return sendSuccess(res, 200, "Chat deleted successfully", { chatID });
  } catch (error) {
    next(error);
  }
};
