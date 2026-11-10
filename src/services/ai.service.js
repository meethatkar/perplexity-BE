import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import {
  mistralModel,
  groqModel,
  cohereModel,
} from "../config/models.config.js";
import { searchInternet } from "./internet.service.js";
import { createAgent } from "langchain";
import z from "zod/v3";
import { currentDate } from "../utils/currentDate.utils.js";

// Creating new tool for internet-search
export const InternetSearchTool = tool(searchInternet, {
  name: "searchInternet",
  description: "use this tool to get the latest information from the internet",
  schema: z.object({
    query: z.string().describe("The search query to look up on the internet."),
  }),
});

// Agent creation using Gemini for web search reasoning (higher rate limit, reliable tool calling)
const agent = createAgent({
  model: mistralModel,
  tools: [InternetSearchTool],
  systemPrompt: `You are a helpful and accurate research assistant.
Today's date is ${currentDate}.
When asked about recent, current, or latest events, always use the searchInternet tool with search queries relevant to the current year/date, and cite your findings based on the search results.`,
});

export const askAi = async (messages) => {
  try {
    // Sanitize messages so turns strictly alternate
    const sanitizedMessages = [];
    for (const msg of messages || []) {
      if (!msg || typeof msg.content !== "string" || !msg.content.trim())
        continue;
      const role =
        msg.role === "ai" || msg.role === "assistant" ? "ai" : "user";
      const last = sanitizedMessages[sanitizedMessages.length - 1];

      if (last && last.role === role) {
        last.content += "\n" + msg.content.trim();
      } else {
        sanitizedMessages.push({ role, content: msg.content.trim() });
      }
    }

    if (sanitizedMessages.length === 0) {
      return "Hello! How can I assist you today?";
    }

    const langchainMessages = sanitizedMessages.map((msg) => {
      return msg.role === "user"
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content);
    });

    const response = await agent.invoke({
      messages: langchainMessages,
    });

    const lastMessage = response?.messages?.[response.messages.length - 1];

    if (!lastMessage) return null;

    // 1. If it's already a plain string, return it
    if (typeof lastMessage.content === "string") {
      return lastMessage.content;
    }

    // 2. If it's an array of chunks/blocks, combine the text fields
    if (Array.isArray(lastMessage.content)) {
      return lastMessage.content
        .map((chunk) => (typeof chunk === "string" ? chunk : chunk.text || ""))
        .join("");
    }

    return String(lastMessage.content || "");
  } catch (error) {
    console.error("AI Error:", error);
    // Propagate AI provider errors (e.g., 429 rate limit) to controller
    throw error;
  }
};

const followUpSchema = z.object({
  questions: z
    .array(z.string())
    .min(3)
    .max(4)
    .describe("An array of 3 to 4 short, highly relevant follow-up questions."),
});

// Create parser from Zod schema (bypasses tool-calling AIMessageChunk quirks in @langchain/cohere)
const followUpParser = StructuredOutputParser.fromZodSchema(followUpSchema);

export const generateFollowUpQuestions = async (prompt, aiAnswer) => {
  try {
    const formatInstructions = followUpParser.getFormatInstructions();

    const response = await cohereModel.invoke([
      new SystemMessage(
        `You are an assistant that suggests concise follow-up questions. Based on the user's query and the assistant's answer, provide 3 to 4 logical questions the user might ask next.\n\n${formatInstructions}`,
      ),
      new HumanMessage(
        `User Prompt: ${prompt}\nAI Answer: ${aiAnswer}\nToday's Date: ${currentDate}\nGenerate follow-up questions.`,
      ),
    ]);

    const rawContent =
      typeof response.content === "string"
        ? response.content
        : Array.isArray(response.content)
          ? response.content
              .map((c) => (typeof c === "string" ? c : c.text || ""))
              .join("")
          : String(response.content || "");

    const parsedData = await followUpParser.parse(rawContent);
    return parsedData.questions || [];
  } catch (error) {
    console.error(
      "ERROR occurred in generating follow up questions with Cohere: ",
      error,
    );
    return [];
  }
};

// Title generator powered by Groq
export const generateTitle = async (prompt) => {
  try {
    const instruction = await groqModel.invoke([
      new SystemMessage(
        "Generate a short, concise title (max 6 words) based on the prompt. Do not use quotes, asterisks, markdown, or any prefix like 'Title:'. Return only the plain text title.",
      ),
      new HumanMessage("Generate a title for this message: " + prompt),
    ]);

    return typeof instruction.content === "string"
      ? instruction.content.trim()
      : String(instruction.content || "New Chat");
  } catch (error) {
    console.error("Generate Title Error with Groq:", error);
    return "New Chat";
  }
};
