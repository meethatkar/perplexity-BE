import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.7-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
  maxRetries: 2,
  thinking_level: "MINIMAL",
});

export const askAi = async (prompt) => {
  console.log("RANNED");

  try {
    console.log("TRIED");
    const response = await model.invoke([["human", prompt]]);
    console.log("DONE");
    console.log("AI Response:", response.content);
    return response;
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
};
