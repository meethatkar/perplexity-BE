import { transcribeAudioWithGroq } from "../services/transcription.service.js";

export const handleTranscribe = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No Audio file provided" });
    }

    const text = await transcribeAudioWithGroq(
      req.file.buffer,
      req.file.originalName || "audio.webm",
    );

    return res.status(200).json({
      success: true,
      text,
    });
  } catch (error) {
    console.error("Error in Transcribe Controller: ", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
