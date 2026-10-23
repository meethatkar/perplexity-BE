import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MistralAI } from "@langchain/mistralai";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-3.7-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
  maxRetries: 2,
  thinking_level: "MINIMAL",
});

const mistralModel = new MistralAI({
  model: "ministral-3b-2512",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
  maxRetries: 2,
});

export const askAi = async (messages) => {
  try {
    console.log("CHECK :", messages);

    const response = await mistralModel.invoke(
      messages.map((msg) => {
        console.log("MSG GSM: ", msg);
        return msg.role == "user"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content);
      }),
    );
    return response;
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
};

export const generateTitle = async (prompt) => {
  try {
    const instruction = await mistralModel.invoke([
      new SystemMessage(
        "generate a title based on the prompt, keep title short and concise but covering main concept of the prompt such that by reading the title user will understand what the chat is all about.",
      ),
      new HumanMessage("generate a title for this message: " + prompt),
    ]);

    return instruction;
  } catch (error) {
    console.error("Generate Title Error:", error);
    return null;
  }
};
