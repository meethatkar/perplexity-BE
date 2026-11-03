import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI, MistralAI } from "@langchain/mistralai";
import { searchInternet } from "./internet.service.js";
import { createAgent } from "langchain";
import z from "zod/v3";
import { currentDate } from "../utils/currentDate.utils.js";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-3.7-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
  maxRetries: 2,
  thinking_level: "MINIMAL",
});

const mistralModel = new ChatMistralAI({
  model: "ministral-3b-2512",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
  maxRetries: 2,
});

// Creating new tool for internet-search
export const InternetSearchTool = tool(searchInternet, {
  name: "searchInternet",
  description: "use this tool to get the latest information from the internet",
  schema: z.object({
    query: z.string().describe("The search query to look up on the internet."),
  }),
});

// agent creation to use multiple tools
const agent = createAgent({
  model: mistralModel,
  tools: [InternetSearchTool],
  systemPrompt: `You are a helpful and accurate research assistant.
Today's date is ${currentDate}.
When asked about recent, current, or latest events, always use the searchInternet tool with search queries relevant to the current year/date, and cite your findings based on the search results.`,
});

export const askAi = async (messages) => {
  try {
    const response = await agent.invoke({
      messages: messages.map((msg) => {
        if (msg.role == "user") {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      }),
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
    return null;
  }
};

const followUpSchema = z.object({
  questions: z
    .array(z.string())
    .min(3)
    .max(4)
    .describe("An array of 3 to 4 short, highly relevant follow-questions."),
});

const questionsGenerator = mistralModel.withStructuredOutput(followUpSchema, {
  name: "generate_follow_ups",
});

export const generateFollowUpQuestions = async (prompt, aiAnswer) => {
  try {
    const questions = await questionsGenerator.invoke([
      new SystemMessage(
        "You are an assistant that suggests concise follow-up questions. Based on the user's query and the assistant's answer, provide 3 to 4 logical questions the user might ask next.",
      ),
      new HumanMessage(
        `User Prompt: ${prompt}\nAI Answer: ${aiAnswer}\nToday's Date: ${currentDate}\nGenerate follow-up questions.`,
      ),
    ]);

    return questions.questions || [];
  } catch (error) {
    console.log("ERROR occured in generating follow up questions: ", error);
    return [];
  }
};

export const generateTitle = async (prompt) => {
  try {
    const instruction = await mistralModel.invoke([
      new SystemMessage(
        "generate a short, concise title (max 6 words) based on the prompt. Do not use quotes, asterisks, markdown, or any prefix like 'Title:'. Return only the plain text title.",
      ),
      new HumanMessage("generate a title for this message: " + prompt),
    ]);

    return typeof instruction.content === "string"
      ? instruction.content.trim()
      : String(instruction.content || "New Chat");
  } catch (error) {
    console.error("Generate Title Error:", error);
    return "New Chat";
  }
};
