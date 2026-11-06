import {
  askAi,
  generateFollowUpQuestions,
  generateTitle,
} from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { sendSuccess } from "../utils/response.js";
import { ValidationError, NotFoundError, AppError } from "../utils/AppError.js";

export const processAIRequest = async (req, res, next) => {
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
        git,
        title: title,
      });
    }

    await messageModel.create({
      chat: chatID || chatData._id,
      content: prompt.trim(),
      role: "user",
    });

    const messages = await messageModel
      .find({ chat: chatID || chatData._id })
      .sort({ createdAt: 1 });

    const response = await askAi(messages);

    if (!response) {
      return next(
        new AppError("Failed to generate AI response", 502, "AI_SERVICE_ERROR"),
      );
    }

    const aiResponseData = await messageModel.create({
      chat: chatID || chatData._id,
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
