import "dotenv/config";
import { connectDB } from "./src/config/database.js";
import app from "./src/app.js";
import { askAi } from "./src/services/ai.service.js";

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });
