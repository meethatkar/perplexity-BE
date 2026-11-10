import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatGroq } from "@langchain/groq";
import { ChatCohere } from "@langchain/cohere";

/**
 * Gemini Chat Model
 */
export const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-3.8-flash",
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
  temperature: 0,
  maxRetries: 3,
});

/**
 * Mistral Chat Model
 */
export const mistralModel = new ChatMistralAI({
  model: "ministral-3b-2512",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
  maxRetries: 2,
});

/**
 * Cohere Chat Model (Perplexity / RAG style)
 */
export const cohereModel = new ChatCohere({
  apiKey: process.env.COHERE_API_KEY,
  model: "command-r-plus-08-2024",
  temperature: 0.3,
  maxRetries: 2,
});

/**
 * Groq Chat Model
 */
export const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-20b",
  temperature: 0.2,
  maxRetries: 2,
});
