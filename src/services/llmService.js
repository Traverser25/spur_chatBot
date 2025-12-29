import OpenAI from "openai";
import axios from "axios";
import { SYSTEM_PROMPT, DEFAULT_USER_PROMPT } from "../config/prompt.js";
import dotenv from "dotenv";
dotenv.config();


const GROQ_API_KEY = process.env.GROK_API_KEY;

const groq = axios.create({
  baseURL: "https://api.groq.com/openai/v1/chat",
  headers: {
    Authorization: `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json"
  },
  timeout: 15_000 // 
});

// ---------- Config ----------
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

// ---------- Utils ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isRetryable(err) {
  const status = err?.response?.status;
  return status === 429 || status >= 500;
}

function log(level, message, meta = {}) {
  console[level](
    JSON.stringify({
      level,
      message,
      ...meta,
      timestamp: new Date().toISOString()
    })
  );
}

// ---------- Main ----------


export async function generateOpenAIReply2(
  messages,
  model = "gpt-4o-mini"
) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages must be a non-empty array");
  }

  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    try {
      log("info", "OpenAI request started", {
        attempt,
        model,
        messageCount: messages.length,
      });

      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 500,
        timeout: TIMEOUT_MS,
      });

      const reply = response?.choices?.[0]?.message?.content;

      if (!reply) {
        throw new Error("Empty response from OpenAI");
      }

      log("info", "OpenAI request success", { attempt });
      return reply.trim();
    } catch (err) {
      const status = err?.response?.status;
      const retryable = isRetryable(err);

      log(
        retryable ? "warn" : "error",
        "OpenAI request failed",
        {
          attempt,
          status,
          retryable,
          error: err.response?.data || err.message,
        }
      );

      if (!retryable || attempt === MAX_RETRIES) break;

      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      await sleep(delay);

      attempt++;
    }
  }

  return "Sorry, I couldn't generate a response at the moment.";
}



export async function generateGroqReply2(
  messages,
  model = "llama-3.3-70b-versatile"
) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages must be a non-empty array");
  }

  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    try {
      log("info", "Groq request started", {
        attempt,
        model,
        messageCount: messages.length
      });

      const response = await groq.post("/completions", {
        model,
        messages,
        temperature: 0
      });

      const reply = response?.data?.choices?.[0]?.message?.content;

      if (!reply) {
        throw new Error("Empty response from Groq");
      }

      log("info", "Groq request success", { attempt });
      return reply.trim();
    } catch (err) {
      const status = err?.response?.status;
      const retryable = isRetryable(err);

      log(
        retryable ? "warn" : "error",
        "Groq request failed",
        {
          attempt,
          status,
          retryable,
          error: err.response?.data || err.message
        }
      );

      if (!retryable || attempt === MAX_RETRIES) {
        break;
      }

     
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      await sleep(delay);

      attempt++;
    }
  }

  return "Sorry, I couldn't generate a response at the moment.";
}