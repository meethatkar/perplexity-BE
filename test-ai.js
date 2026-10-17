import "dotenv/config";
import { askAi } from "./src/services/ai.service.js";

async function run() {
  try {
    console.log("Starting AI request...");
    const res = await askAi("Why do parrots talk?");
    console.log("Response:", res);
  } catch (err) {
    console.error("Error occurred:", err);
  }
}
run();
