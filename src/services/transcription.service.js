import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const transcribeAudioWithGroq = async (
  fileBuffer,
  originalName = "audio.webm",
) => {
  const file = new File([fileBuffer], originalName, {
    type: "audio/webm",
  });

  const transcription = await groq.audio.transcriptions.create({
    file: file,
    model: "whisper-large-v3-turbo",
    response_format: "json",
    language: "en",
  });

  return transcription.text;
};
