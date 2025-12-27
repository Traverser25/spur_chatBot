import { pipeline } from "@xenova/transformers";
import {
  EMBEDDING_MODEL,
  MAX_EMBED_TEXT_LENGTH,
  MIN_EMBED_TEXT_LENGTH
} from "../config/constants.js";

let embedderInstance = null;

async function loadEmbedder() {
  if (!embedderInstance) {
    embedderInstance = await pipeline(
      "feature-extraction",
      EMBEDDING_MODEL
    );
  }
  return embedderInstance;
}

function validateText(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Text must be a non-empty string");
  }

  const cleaned = text.trim();

  if (cleaned.length < MIN_EMBED_TEXT_LENGTH) {
    throw new Error("Text too short for embedding");
  }

  if (cleaned.length > MAX_EMBED_TEXT_LENGTH) {
    throw new Error("Text too long for embedding");
  }

  return cleaned;
}

export async function embedText(text) {
  const validatedText = validateText(text);
  const embedder = await loadEmbedder();

  const tensor = await embedder(validatedText, {
    pooling: "mean",
    normalize: true
  });

  return Array.from(tensor.data).map(Number);
}
