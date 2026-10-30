import { askAi, generateTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

export const processAIRequest = async (req, res, next) => {
  try {
    const { prompt, chatID } = req.body;
    if (!prompt || prompt.trim() === "" || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid prompt" });
    }
    let chatData;
    if (!chatID) {
      const title = await generateTitle(prompt);
      chatData = await chatModel.create({
        user: req.user.id,
        title: title,
      });
    }

    const userResponseData = await messageModel.create({
      chat: chatID || chatData._id,
      content: prompt,
      role: "user",
    });

    const messages = await messageModel
      .find({ chat: chatID || chatData._id })
      .sort({ createdAt: 1 });

    console.log("MSG MSG: ", messages);

    const response = await askAi(messages);

    const aiResponseData = await messageModel.create({
      chat: chatID || chatData._id,
      content: response,
      role: "ai",
    });

    if (!response) {
      return res
        .status(500)
        .json({ success: false, message: "AI service error" });
    }

    return res.status(200).json({
      success: true,
      message: "Prompt processed successfully",
      response: aiResponseData,
      chatDetails: chatData,
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

    return res.status(200).json({
      success: true,
      message: "chats fetched successfully",
      chats,
    });
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
    console.log("SINGLE CHAT: ", chat);

    if (!chat) {
      return res.status(404).json({
        message: "chat not found",
        success: false,
      });
    }

    const messages = await messageModel.find({ chat: chatId });

    return res.status(200).json({
      message: "messages fetched for chat",
      response: messages,
      sucess: true,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteChat = async (req, res, next) => {
  const { chatID } = req.body;
  const userId = req.user.id;
  try {
    const deleteChat = await chatModel.findOneAndDelete({
      _id: chatID,
      user: userId,
    });

    if (!deleteChat) {
      return res.status(404).json({
        message: "chat not found",
        success: false,
      });
    }

    const deleteMessages = await messageModel.deleteMany({
      chat: chatID,
    });

    return res.status(201).json({
      message: "chat deleted successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
