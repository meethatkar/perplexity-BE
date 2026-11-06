import { transcribeAudioWithGroq } from "../services/transcription.service.js";
import { sendSuccess } from "../utils/response.js";
import { ValidationError } from "../utils/AppError.js";

export const handleTranscribe = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(
        new ValidationError({ audio: "Audio recording file is required" }, "No audio file received"),
      );
    }

    const text = await transcribeAudioWithGroq(
      req.file.buffer,
      req.file.originalname || "audio.webm",
    );

    return sendSuccess(res, 200, "Audio transcribed successfully", { text });
  } catch (error) {
    next(error);
  }
};
